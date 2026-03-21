import { NextResponse } from "next/server";

import db from "@/lib/db";
import { getPlaybackUrl } from "@/lib/video-urls";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const video = await db.video.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!video) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json({
    watchUrl: `/w/${id}`,
    streamUrl: video.status === "done" ? getPlaybackUrl(id) : "",
  });
}
