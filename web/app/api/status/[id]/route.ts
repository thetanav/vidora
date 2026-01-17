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
  const { id } = await context.params;

  const video = await db.video.findUnique({ where: { id } });
  if (!video) {
    return new NextResponse("no video");
  }

  await db.video.update({
    where: { id },
    data: { status: "done" },
  });

  return new NextResponse("ok");
}
