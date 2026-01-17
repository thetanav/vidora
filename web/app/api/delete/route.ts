import { auth } from "@/auth";
import db from "@/lib/db";
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = (await req.json()) as { id?: string };
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const video = await db.video.findUnique({ where: { id } });
  if (!video || video.userId !== session.user.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await db.video.delete({ where: { id } });
  await redis.del("status:" + id);

  return new NextResponse("ok");
}
