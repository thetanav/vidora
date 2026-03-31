import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth-client";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const statuses = statusParam
    ? statusParam
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  const where = {
    userId: session.user.id,
    ...(statuses.length > 0
      ? {
          status: {
            in: statuses,
          },
        }
      : {}),
  };

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
