import db from "@/lib/db";
import TranscodingItem from "@/components/transcoding-item";
import PageShell from "@/components/page-shell";
import { CheckCircle2 } from "lucide-react";

export default async function Page() {
  const videos = await db.video.findMany({
    where: {
      status: "pending",
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageShell title="Transcoding" description="Status of pending videos">
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="text-sm font-semibold">No active transcoding</h3>
          <p className="text-sm text-muted-foreground">
            All videos have been processed successfully.
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-4">
          {videos.map((video) => (
            <TranscodingItem key={video.id} video={video} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
