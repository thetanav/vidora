"use client";

import { useEffect, useState } from "react";
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
import { File, Upload } from "lucide-react";
import { UploadButton } from "./uploadthing";

import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";

export default function VideoUpload() {
  const router = useRouter();
  const [file, setFile] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [extension, setExtension] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [id, setId] = useState("");

  useEffect(() => {
    setId(nanoid(16));
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="mb-8">
        {id}
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
            {file ? (
              <div>
                <File className="mr-2 h-4 w-4" />
                <span>{file.name}</span>
                <span>{file.size}</span>
                <span>{file.type}</span>
              </div>
            ) : (
              <UploadButton
                endpoint="videoUploader"
                headers={{ "x-video-id": id }}
                onUploadBegin={(res) => {
                  console.log("Upload Begin: ", res);
                }}
                onClientUploadComplete={(res) => {
                  // Do something with the response
                  setFile(res[0]);
                  setExtension(res[0].name?.split(".").pop()!);
                }}
                onUploadError={(error: Error) => {
                  // Do something with the error.
                  alert(`ERROR! ${error.message}`);
                }}
              />
            )}
          </div>

          <Button
            disabled={!file}
            size="lg"
            onClick={() => {
              fetch(`/api/video/upload`, {
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
            }}>
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
