"use client";

import { useMemo, useState } from "react";

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
    if (!file) return;

    setState({ status: "uploading", progress: 0 });

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("video", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/video/upload`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      setState({ status: "uploading", progress: percent });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText) as { id: string };
          setState({ status: "done", id: json.id });
        } catch {
          setState({ status: "done", id: "" });
        }
      } else {
        setState({
          status: "error",
          message: xhr.responseText || "Upload failed",
        });
      }
    };

    xhr.onerror = () => {
      setState({ status: "error", message: "Network error" });
    };

    xhr.send(formData);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Upload video</h1>
      <p className="mt-1 text-sm opacity-80">
        Add a title + description, then upload your video.
      </p>

      <div className="mt-8 space-y-5 rounded-xl border border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            value={title}
            maxLength={120}
            placeholder="A great title (required)"
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/10 dark:focus:ring-white/20"
          />
          <div className="text-xs opacity-60">{title.trim().length}/120</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            placeholder="Tell viewers what this video is about"
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full resize-y rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/10 dark:focus:ring-white/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="file">
            Video file
          </label>
          <input
            id="file"
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
          {file && (
            <div className="text-xs opacity-70">
              <div>
                <span className="font-medium">Name:</span> {file.name}
              </div>
              <div>
                <span className="font-medium">Size:</span> {formatBytes(file.size)}
              </div>
              <div>
                <span className="font-medium">Type:</span> {file.type || "unknown"}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={uploadVideo}
            disabled={!canUpload}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black">
            {state.status === "uploading" ? "Uploading…" : "Upload"}
          </button>

          {state.status === "uploading" && (
            <div className="min-w-[220px]">
              <div className="flex items-center justify-between text-xs opacity-80">
                <span>Progress</span>
                <span>{state.progress}%</span>
              </div>
              <progress className="mt-1 h-2 w-full" value={state.progress} max={100} />
            </div>
          )}
        </div>

        {state.status === "done" && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm">
            <div className="font-medium">Upload complete</div>
            {state.id && (
              <div className="mt-1 opacity-80">
                Watch:{" "}
                <a className="underline" href={`/w/${state.id}`}>{`/w/${state.id}`}</a>
              </div>
            )}
            <div className="mt-1 opacity-80">Processing can take a bit.</div>
          </div>
        )}

        {state.status === "error" && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm">
            <div className="font-medium">Upload failed</div>
            <div className="mt-1 whitespace-pre-wrap opacity-80">{state.message}</div>
          </div>
        )}
      </div>
    </div>
  );
}
