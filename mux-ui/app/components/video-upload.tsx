"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Upload } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000";

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "done"; id: string }
  | { status: "error"; message: string };

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB"] as const;
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState<UploadState>({ status: "idle" });

  const canUpload = useMemo(() => {
    if (!file) return false;
    if (title.trim().length === 0) return false;
    return state.status !== "uploading";
  }, [file, title, state.status]);

  const uploadVideo = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    console.log("Starting upload:", { title, fileName: file.name, fileSize: file.size });
    setState({ status: "uploading", progress: 0 });

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("video", file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/video/upload`);
    xhr.timeout = 0;
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      setState({
        status: "uploading",
        progress: Math.round((e.loaded / e.total) * 100),
      });
    };

    xhr.onload = () => {
      console.log("Upload response:", { status: xhr.status, body: xhr.responseText });
      if (xhr.status >= 200 && xhr.status < 300) {
        const json = JSON.parse(xhr.responseText);
        console.log("Upload successful:", json);
        setState({ status: "done", id: json.id });
      } else {
        console.error("Upload failed:", xhr.status, xhr.responseText);
        setState({ status: "error", message: xhr.responseText });
      }
    };

    xhr.onerror = () => {
      console.error("Network error during upload");
      setState({ status: "error", message: "Network error" });
    };

    xhr.send(formData);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload Video</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a title and description, then upload your video to get started.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Video Details</CardTitle>
          <CardDescription>
            Fill in the information about your video
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              maxLength={120}
              placeholder="A great title (required)"
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              {title.trim().length} / 120 characters
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              placeholder="Tell viewers what this video is about..."
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Video File Field */}
          <div className="space-y-2">
            <Label htmlFor="file">
              Video File <span className="text-red-500">*</span>
            </Label>
            <Input
              id="file"
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && (
              <div className="mt-3 rounded-md bg-secondary/50 p-3 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Name:</span>
                    <span className="text-muted-foreground">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Size:</span>
                    <span className="text-muted-foreground">
                      {formatBytes(file.size)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Type:</span>
                    <span className="text-muted-foreground">
                      {file.type || "unknown"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {state.status === "uploading" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Upload Progress</span>
                <span className="text-sm font-semibold">{state.progress}%</span>
              </div>
              <Progress value={state.progress} />
            </div>
          )}

          {/* Success Alert */}
          {state.status === "done" && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Upload Complete!</AlertTitle>
              <AlertDescription>
                <div className="space-y-2">
                  <p>Your video has been uploaded successfully.</p>
                  <p className="text-xs">
                    Processing can take a few moments. You can watch your video
                    here:{" "}
                    <a
                      href={`/w/${state.id}`}
                      className="font-semibold underline hover:no-underline"
                    >
                      /w/{state.id}
                    </a>
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {state.status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Upload Failed</AlertTitle>
              <AlertDescription>
                <p className="whitespace-pre-wrap font-mono text-xs">
                  {state.message}
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={uploadVideo}
              disabled={!canUpload}
              size="lg"
            >
              <Upload className="mr-2 h-4 w-4" />
              {state.status === "uploading" ? "Uploading…" : "Upload Video"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
