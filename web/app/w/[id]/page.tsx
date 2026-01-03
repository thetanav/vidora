import Player from "./player";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Activity,
} from "lucide-react";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await db.video.findUnique({
    where: {
      id,
    },
  });

  if (!video) notFound();

  return (
    <div className="min-h-screen bg-background w-full">
      <Link className="absolute top-4 left-4 right-0 z-50" href="/home">
        <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </Link>

      <main className="pt-16 p-8 w-full mx-auto max-w-6xl space-y-4">
        <div className="rounded-xl overflow-hidden border w-full min-h-[40vh] flex items-center justify-center bg-muted/20">
          {video.status === "done" ? (
            <Player id={id} />
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Activity className="w-8 h-8 text-muted-foreground animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Video Processing
              </h3>
              <p className="text-sm text-muted-foreground">
                Your video is being transcoded. Check back soon!
              </p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {video.title}
          </h1>
          {video.description && (
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {video.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-3">
              <Image
                src="/per1.png"
                alt="Tanav Poswal"
                width={48}
                height={48}
                className="rounded-full border-2 border-border"
              />
              <div>
                <h3 className="font-semibold text-foreground">Tanav Poswal</h3>
                <p className="text-sm text-muted-foreground">
                  12.3M subscribers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline">
                <ThumbsUp className="w-4 h-4" />
                {video.likes || 0}
              </Button>
              <Button size="icon" variant="outline">
                <ThumbsDown className="w-4 h-4" />
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {video.views || 0} views
              </span>
              <span className="mx-2">·</span>
              <span>{new Date(video.createdAt).toDateString()}</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
