import db from "@/lib/db";
import VideoCard from "@/components/video-card";
import { Search } from "lucide-react";

export default async function Page() {
  const videos = await db.video.findMany();

  return (
    <div className="min-h-screen">
      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Videos</h1>
          <p className="text-sm text-muted-foreground">
            {videos.length} video{videos.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="px-6 py-6">
        {videos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No videos found
            </h3>
            <p className="text-sm text-muted-foreground">
              Upload your first video to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
