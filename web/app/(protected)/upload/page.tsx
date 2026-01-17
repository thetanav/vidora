"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Upload, CheckCircle2, X, Loader2, Image as ImageIcon } from "lucide-react";
import PageShell from "@/components/page-shell";
import { UploadButton } from "@/components/uploadthing";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUploadThing } from "@/components/uploadthing";

interface UploadedFile {
  name: string;
  size: number;
  url: string;
  key: string;
}

export default function Page() {
  const router = useRouter();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [title, setTitle] = useState("");
  const [extension, setExtension] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [id] = useState(() => nanoid(16));
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isCapturingThumbnail, setIsCapturingThumbnail] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { startUpload: uploadThumbnail } = useUploadThing("thumbnailUploader", {
    headers: { "x-video-id": id },
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        setThumbnailUrl(res[0].ufsUrl);
        toast.success("Thumbnail captured!");
      }
    },
    onUploadError: (error) => {
      toast.error(`Thumbnail upload failed: ${error.message}`);
    },
  });

  const compressImage = useCallback(async (
    canvas: HTMLCanvasElement,
    maxSizeBytes: number = 4 * 1024 * 1024 // 4MB
  ): Promise<Blob> => {
    let quality = 0.9;
    let blob: Blob | null = null;

    // Try progressively lower quality until under size limit
    while (quality > 0.1) {
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
      });

      if (blob && blob.size <= maxSizeBytes) {
        return blob;
      }

      quality -= 0.1;
    }

    // If still too large, scale down the canvas
    if (!blob || blob.size > maxSizeBytes) {
      let scale = 0.8;
      const originalWidth = canvas.width;
      const originalHeight = canvas.height;

      while (scale > 0.2) {
        const scaledCanvas = document.createElement("canvas");
        scaledCanvas.width = Math.floor(originalWidth * scale);
        scaledCanvas.height = Math.floor(originalHeight * scale);

        const ctx = scaledCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

          blob = await new Promise<Blob | null>((resolve) => {
            scaledCanvas.toBlob((b) => resolve(b), "image/jpeg", 0.85);
          });

          if (blob && blob.size <= maxSizeBytes) {
            return blob;
          }
        }

        scale -= 0.1;
      }
    }

    // Return whatever we have, even if over limit
    if (!blob) {
      throw new Error("Failed to compress image");
    }

    return blob;
  }, []);

  const captureRandomFrame = useCallback(async (videoFile: File) => {
    setIsCapturingThumbnail(true);

    try {
      const video = document.createElement("video");
      video.preload = "metadata";

      const videoUrl = URL.createObjectURL(videoFile);
      video.src = videoUrl;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Failed to load video metadata"));
      });

      // Get random time from first 3 minutes (or video duration if shorter)
      const maxTime = Math.min(video.duration, 180); // 180 seconds = 3 minutes
      const randomTime = Math.random() * maxTime;

      video.currentTime = randomTime;

      await new Promise<void>((resolve, reject) => {
        video.onseeked = () => resolve();
        video.onerror = () => reject(new Error("Failed to seek video"));
      });

      // Create canvas and capture frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas context");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Compress to under 4MB
      const blob = await compressImage(canvas, 4 * 1024 * 1024);

      // Create preview
      const previewUrl = URL.createObjectURL(blob);
      setThumbnailPreview(previewUrl);

      // Upload thumbnail
      const thumbnailFile = new File([blob], `thumbnail-${id}.jpg`, {
        type: "image/jpeg",
      });

      await uploadThumbnail([thumbnailFile]);

      // Cleanup
      URL.revokeObjectURL(videoUrl);
    } catch (error) {
      console.error("Failed to capture thumbnail:", error);
      toast.error("Failed to capture thumbnail");
    } finally {
      setIsCapturingThumbnail(false);
    }
  }, [id, uploadThumbnail, compressImage]);

  const {
    mutate: uploadVideo,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          id,
          extension,
          thumbnailUrl,
        }),
      });
      const data = await res.json();
      if (data.data != "ok") {
        toast.error("Upload failed");
        return data;
      }
      toast.success("Uploaded successfully");
      setTimeout(() => {
        router.push("/home");
      }, 2000);
      return data;
    },
  });

  const removeFile = () => {
    setFile(null);
    setExtension(null);
    setThumbnailUrl(null);
    setThumbnailPreview(null);
  };

  return (
    <main>
      <PageShell title="Upload" description="Add a new video">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight">Video details</h2>
            <p className="text-sm text-muted-foreground">
              Fill in the information about your video.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              maxLength={120}
              placeholder="A great title (required)"
              onChange={(e) => setTitle(e.target.value)}
              className="h-11"
            />
            <div className="text-xs text-muted-foreground text-right">
              {title.trim().length} / 120 characters
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              placeholder="Tell viewers what this video is about..."
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Video File <span className="text-destructive">*</span>
            </Label>
            {file ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg border border-border">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Thumbnail Preview */}
                {(thumbnailPreview || isCapturingThumbnail) && (
                  <div className="space-y-2">
                    <Label>Thumbnail</Label>
                    <div className="relative w-48 aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                      {isCapturingThumbnail ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : thumbnailPreview ? (
                        <img
                          src={thumbnailPreview}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    {thumbnailUrl && (
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Thumbnail uploaded
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  MP4, MOV, or AVI (max 500MB)
                </p>
                <UploadButton
                  endpoint="videoUploader"
                  headers={{ "x-video-id": id }}
                  onClientUploadComplete={async (res) => {
                    if (res[0]) {
                      setFile(res[0]);
                      const ext = res[0].name?.split(".").pop();
                      if (ext) setExtension(ext);

                      // Fetch the uploaded video and capture thumbnail
                      try {
                        const response = await fetch(res[0].ufsUrl);
                        const blob = await response.blob();
                        const videoFile = new File([blob], res[0].name, { type: blob.type });
                        captureRandomFrame(videoFile);
                      } catch (error) {
                        console.error("Failed to fetch video for thumbnail:", error);
                      }
                    }
                  }}
                  onUploadError={(error: Error) => {
                    alert(`ERROR! ${error.message}`);
                  }}
                />
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button
              disabled={!file || !title.trim() || isPending || isSuccess || isCapturingThumbnail}
              size="lg"
              className="w-full gap-2"
              onClick={() => uploadVideo()}>
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Upload Complete! Redirecting...
                </>
              ) : isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : isCapturingThumbnail ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Thumbnail...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Video
                </>
              )}
            </Button>
          </div>
        </div>
      </PageShell>

      {/* Hidden elements for video processing */}
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}
