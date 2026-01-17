"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";

import TranscodingItem from "@/components/transcoding-item";

type Video = {
  id: string;
  title: string;
  views: number;
  likes: number;
  status: string;
  createdAt: string;
  thumbnail?: string | null;
};

type ClientVideo = Omit<Video, "createdAt"> & { createdAt: Date };

async function fetchPendingVideos(): Promise<Video[]> {
  const res = await fetch("/api/videos?status=pending", {
    cache: "no-store",
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load videos");
  }

  return res.json();
}

export default function TasksClient() {
  const { data: videos = [] } = useQuery({
    queryKey: ["videos", "pending"],
    queryFn: fetchPendingVideos,
    refetchInterval: 5000,
    staleTime: 2000,
  });

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </div>
        <h3 className="text-sm font-semibold">No active transcoding</h3>
        <p className="text-sm text-muted-foreground">
          All videos have been processed successfully.
        </p>
      </div>
    );
  }

  const hydratedVideos: ClientVideo[] = videos.map((video) => ({
    ...video,
    createdAt: new Date(video.createdAt),
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {hydratedVideos.map((video) => (
        <TranscodingItem key={video.id} video={video} />
      ))}
    </div>
  );
}
