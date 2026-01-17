import PageShell from "@/components/page-shell";

import { dehydrate, QueryClient } from "@tanstack/react-query";

import db from "@/lib/db";
import { RQHydrate } from "@/components/rq-hydrate";
import TasksClient from "./tasks-client";

export const dynamic = "force-dynamic";

async function getPendingVideos() {
  return db.video.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
  });
}

export default async function Page() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["videos", "pending"],
    queryFn: getPendingVideos,
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <PageShell title="Transcoding" description="Status of pending videos">
      <RQHydrate state={dehydratedState}>
        <TasksClient />
      </RQHydrate>
    </PageShell>
  );
}
