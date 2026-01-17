import db from "@/lib/db";
import VideoCard from "@/components/video-card";
import PageShell from "@/components/page-shell";
import { Search } from "lucide-react";

export default async function Page() {
  const videos = await db.video.findMany();

  return (
    <PageShell
      title="Videos"
      description={`${videos.length} video${videos.length === 1 ? "" : "s"}`}
    >
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold">No videos found</h3>
          <p className="text-sm text-muted-foreground">
            Upload your first video to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
