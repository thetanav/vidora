import Player from "./player";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import { ArrowLeft, ThumbsUp, ThumbsDown, Link2, Share2 } from "lucide-react";

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
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border">
        <Link href="/home">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </nav>

      <main className="pt-24 pb-16 w-full mx-auto max-w-6xl space-y-4">
        <div className="rounded-xl overflow-hidden border w-full h-[60vh] flex items-center justify-center">
          {video.status === "done" ? (
            <Player id={id} />
          ) : (
            <p>Video not processed yet : (</p>
          )}
        </div>

        <div className="mt-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {video.title}
          </h1>
          {video.description && (
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {video.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6">
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
              <Button>
                <ThumbsUp className="w-4 h-4" />
                {video.likes || 0}
              </Button>
              <Button size="icon">
                <ThumbsDown className="w-4 h-4" />
              </Button>
              <Button>
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
