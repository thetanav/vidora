import db from "@/lib/db";
import { Loader2 } from "lucide-react";

export default async function Page() {
  const videos = await db.video.findMany({
    where: {
      duration: 0,
    },
  });

  return (
    <main className="pt-24 px-6">
      <h1 className="text-3xl font-bold mb-8">Processing Videos</h1>
      {videos.length === 0 ? (
        <p className="text-gray-600">No videos are currently processing.</p>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="font-medium">{video.title}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Transcoding...
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
