import { auth } from "@/lib/auth";
import db from "@/lib/db";
import VideoCard from "@/components/video-card";
import PageShell from "@/components/page-shell";
import { Video } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) return null;

  const videos = await db.video.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageShell
      title="Videos"
      description={videos.length > 0 ? `${videos.length} total` : undefined}
      right={
        <Button asChild size="sm">
          <Link href="/upload">Upload</Link>
        </Button>
      }
    >
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Video className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-sm">No videos yet</h3>
            <p className="text-sm text-muted-foreground">Upload your first video to get started.</p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/upload">Upload video</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
