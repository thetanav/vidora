"use client";

import { useState } from "react";
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
import { Upload, ArrowLeft, CheckCircle2, X, Loader2 } from "lucide-react";
import { UploadButton } from "@/components/uploadthing";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    await fetch(`/api/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        id,
        extension,
      }),
    });
    router.push("/");
  };

  const removeFile = () => {
    setFile(null);
    setExtension(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur px-6 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link
            href="/video"
            className="flex items-center gap-2 text-xl font-bold">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <svg
                className="w-4 h-4 text-white fill-white"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-foreground tracking-tight">StreamFlow</span>
          </Link>
          <Link href="/video">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
      </nav>

      <main className="py-12">
        <div className="mx-auto w-full max-w-2xl px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Upload Video
            </h1>
            <p className="mt-2 text-muted-foreground">
              Add a title and description, then upload your video
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
                      onClientUploadComplete={(res) => {
                        if (res[0]) {
                          setFile(res[0]);
                          const ext = res[0].name?.split(".").pop();
                          if (ext) setExtension(ext);
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
                  disabled={!file || !title.trim() || uploading}
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleSubmit}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Video
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
