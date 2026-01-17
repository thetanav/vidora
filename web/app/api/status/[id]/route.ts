import { auth } from "@/auth";
import db from "@/lib/db";
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const percent = Number(await redis.get(`status:${id}`)) || 0;
  return NextResponse.json({ percent });
}

export async function POST(_req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;

  const video = await db.video.findUnique({ where: { id } });
  if (!video || video.userId !== session.user.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await db.video.update({
    where: { id },
    data: { status: "done" },
  });

  return new NextResponse("ok");
}
