import { NextResponse } from "next/server";

import db from "@/lib/db";

export async function POST(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const video = await db.video.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!video) {
    return new NextResponse("Not found", { status: 404 });
  }

  await db.video.update({
    where: { id },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  return NextResponse.json({ ok: true });
}
