"use client";

import type { SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, ThumbsUp, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import Link from "next/link";
import { toast } from "sonner";

import { getThumbnailUrl } from "@/lib/video-urls";

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    views: number;
    likes: number;
    status: string;
    createdAt: Date;
    thumbnail?: string | null;
  };
}

export default function VideoCard({ video }: VideoCardProps) {
  const router = useRouter();

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const stopEvent = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleRename = async (event: SyntheticEvent) => {
    stopEvent(event);
    const nextTitle = window.prompt("Rename video", video.title)?.trim();
    if (!nextTitle || nextTitle === video.title) {
      return;
    }

    const res = await fetch(`/api/videos/${video.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: nextTitle }),
    });

    if (!res.ok) {
      toast.error("Failed to rename video");
      return;
    }

    toast.success("Video renamed");
    router.refresh();
  };

  const handleDelete = async (event: SyntheticEvent) => {
    stopEvent(event);
    if (!window.confirm(`Delete "${video.title}"?`)) {
      return;
    }

    const res = await fetch(`/api/videos/${video.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Failed to delete video");
      return;
    }

    toast.success("Video deleted");
    router.refresh();
  };

  const handleCopyStreamUrl = async (event: SyntheticEvent) => {
    stopEvent(event);
    const res = await fetch(`/api/videos/${video.id}/share`, {
      cache: "no-store",
    });

    if (!res.ok) {
      toast.error("Failed to load video links");
      return;
    }

    const data = (await res.json()) as { streamUrl?: string };
    if (!data.streamUrl) {
      toast.error("Stream URL is not available yet");
      return;
    }

    await navigator.clipboard.writeText(data.streamUrl);
    toast.success("Stream URL copied");
  };

  const handleShare = async (event: SyntheticEvent) => {
    stopEvent(event);
    const url = `${window.location.origin}/w/${video.id}`;
    await navigator.clipboard.writeText(url);
    toast.success("Watch link copied");
  };

  return (
    <Link href={`/w/${video.id}`} className="group cursor-pointer select-none">
      <div className="relative overflow-hidden rounded-xl bg-muted aspect-video mb-3 border border-border/50 transition-all">
        <img
          src={getThumbnailUrl(video.id, video.thumbnail)}
          alt={video.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />

        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded-md backdrop-blur-sm">
          ??:??
        </div>
      </div>

      <div className="flex justify-between">
        <div>
          <h3 className="font-semibold text-foreground text-sm leading-snug mb-1.5 line-clamp-2 transition-colors">
            {video.title}
          </h3>

          <p className="text-xs text-muted-foreground mb-2">
            {new Date(video.createdAt).toDateString()}
          </p>

          {video.status === "failed" ? (
            <div className="flex items-center gap-1.5 text-destructive text-xs font-medium rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
              Failed
            </div>
          ) : video.status !== "done" ? (
            <div className="flex items-center gap-1.5 text-amber-500/95  text-xs font-medium rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500/95 animate-pulse"></div>
              Processing
            </div>
          ) :
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>{formatNumber(video.views)} views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{formatNumber(video.likes)}</span>
              </div>
            </div>
          }

        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} size={"icon-sm"} onClick={stopEvent}>
              <MoreVertical className="w-4 h-4 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleRename} className="cursor-pointer">
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleCopyStreamUrl}
              className="cursor-pointer">
              Copy stream URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
              Copy watch link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Link>
  );
}
