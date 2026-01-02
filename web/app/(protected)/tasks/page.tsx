import db from "@/lib/db";
import TranscodingItem from "@/components/transcoding-item";

export default async function Page() {
  const videos = await db.video.findMany({
    where: {
      status: "pending",
    },
  });

  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Transcoding Status
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor the real-time progress of your video encoding
          </p>
        </div>
      </div>

      <div className="px-6 py-8">
        {videos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No Active Transcoding
            </h3>
            <p className="text-sm text-muted-foreground">
              All videos have been processed successfully
            </p>
          </div>
        ) : (
          <div className="max-w-3xl space-y-4">
            {videos.map((video) => (
              <TranscodingItem key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
