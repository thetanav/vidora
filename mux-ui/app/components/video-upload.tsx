"use client";

import { useState } from "react";

export default function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("idle");

  const uploadVideo = async () => {
    if (!file) return;

    setStatus("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("video", file);

    const xhr = new XMLHttpRequest();

    xhr.open("POST", "http://localhost:3000/video/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        setStatus("done");
      } else {
        setStatus("error");
      }
    };

    xhr.onerror = () => {
      setStatus("error");
    };

    xhr.send(formData);
  };

  return (
    <div>
      <h2>Upload video</h2>

      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        onClick={uploadVideo}
        disabled={!file || status === "uploading"}
        style={{ marginTop: 12 }}>
        Upload
      </button>

      {status === "uploading" && (
        <div style={{ marginTop: 12 }}>
          <div>Uploading: {progress}%</div>
          <progress value={progress} max={100} />
        </div>
      )}

      {status === "done" && <p>✅ Upload complete</p>}
      {status === "error" && <p>❌ Upload failed</p>}
    </div>
  );
}
