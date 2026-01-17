"use client";

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
import Image from "next/image";

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
  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const handleRename = () => console.log(`Rename video ${video.id}`);
  const handleDelete = () => console.log(`Delete video ${video.id}`);
  const handleDownload = () => console.log(`Download video ${video.id}`);
  const handleShare = () => console.log(`Share video ${video.id}`);

  return (
    <Link href={`/w/${video.id}`} className="group cursor-pointer select-none">
      <div className="relative overflow-hidden rounded-xl bg-muted aspect-video mb-3 border border-border/50 transition-all">
        <img
          src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${video.id}/image.jpg`}
          alt={video.title}
          className="object-cover w-full h-full"
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

          {video.status !== "done" ? (
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
            <Button variant={"ghost"} size={"icon-sm"}>
              <MoreVertical className="w-4 h-4 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleDownload}
              className="cursor-pointer">
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
              Share
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
