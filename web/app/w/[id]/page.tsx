import Player from "./player";
import WatchClient from "./watch-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import { ArrowLeft, ThumbsUp, Activity } from "lucide-react";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await db.video.findUnique({ where: { id } });
  if (!video) notFound();

  const user = await db.user.findUnique({ where: { id: video.userId } });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex h-14 items-center px-4">
          <Link href="/home">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        {/* Video Player */}
        <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
          {video.status === "done" ? (
            <Player id={id} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Activity className="h-5 w-5 text-muted-foreground animate-pulse" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Processing video...</p>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="mt-4">
          <h1 className="text-lg font-medium text-foreground">{video.title}</h1>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Avatar"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {user?.name?.slice(0, 1) || "V"}
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{user?.name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">
                  {video.views || 0} views • {new Date(video.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ThumbsUp className="w-4 h-4" />
                {video.likes || 0}
              </Button>
              <WatchClient videoId={id} isReady={video.status === "done"} />
            </div>
          </div>

          {video.description && (
            <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {video.description}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
