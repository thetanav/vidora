import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { redis } from "@/lib/redis";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = (await req.json()) as { id?: string };
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const video = await db.video.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!video) {
    return new NextResponse("Not found", { status: 404 });
  }

  await db.video.delete({ where: { id } });
  await redis.del(`status:${id}`);

  return NextResponse.json({ ok: true });
}
