import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import db from "@/lib/db";
import { redis } from "@/lib/redis";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(10_000).optional(),
});

async function getOwnedVideo(id: string, userId: string) {
  return db.video.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const video = await getOwnedVideo(id, session.user.id);
  if (!video) {
    return new NextResponse("Not found", { status: 404 });
  }

  let body: z.infer<typeof updateSchema>;
  try {
    body = updateSchema.parse(await req.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.title && body.description === undefined) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  const updated = await db.video.update({
    where: { id },
    data: {
      ...(body.title ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const video = await getOwnedVideo(id, session.user.id);
  if (!video) {
    return new NextResponse("Not found", { status: 404 });
  }

  await db.video.delete({ where: { id } });
  await redis.del(`status:${id}`);

  return NextResponse.json({ ok: true });
}
