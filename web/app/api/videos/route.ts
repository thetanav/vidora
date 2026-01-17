import { NextResponse } from "next/server";

import db from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where = status ? { status } : undefined;

  const videos = await db.video.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(videos, {
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}
