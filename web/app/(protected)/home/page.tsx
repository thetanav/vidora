import { Search } from "lucide-react";
import db from "@/lib/db";
import VideoCard from "@/components/video-card";

export default async function Page() {
  // const [searchQuery, setSearchQuery] = useState("");

  const videos = await db.video.findMany();

  return (
    <div className="min-h-screen">
      <div className="bg-card/50 backdrop-blur">
        <div className="px-6 py-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search videos..."
              // value={searchQuery}
              // onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 text-foreground text-sm rounded-lg border border-border placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
            />
          </div>
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
              Try adjusting your search terms
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
