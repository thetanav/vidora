import PageShell from "@/components/page-shell";

import { dehydrate, QueryClient } from "@tanstack/react-query";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { RQHydrate } from "@/components/rq-hydrate";
import { headers } from "next/headers";
import TasksClient from "./tasks-client";

export const dynamic = "force-dynamic";

async function getJobVideos(userId: string) {
  return db.video.findMany({
    where: {
      userId,
      status: {
        in: ["pending", "processing", "failed"],
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return null;
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["videos", "jobs"],
    queryFn: () => getJobVideos(session.user.id),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <PageShell title="Transcoding" description="Your active and failed jobs">
      <RQHydrate state={dehydratedState}>
        <TasksClient />
      </RQHydrate>
    </PageShell>
  );
}
