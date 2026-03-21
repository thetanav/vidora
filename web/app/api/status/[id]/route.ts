import { auth } from "@/auth";
import db from "@/lib/db";
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";
import { z } from "zod";

const workerStatusSchema = z.object({
  status: z.enum(["pending", "processing", "done", "failed"]),
  progress: z.number().int().min(0).max(100).optional(),
});

function isWorkerAuthorized(req: Request) {
  const secret = process.env.WORKER_SHARED_SECRET;
  if (!secret) {
    return true;
  }

  return req.headers.get("x-worker-secret") === secret;
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const video = await db.video.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: {
      progress: true,
      status: true,
    },
  });

  if (!video) {
    return new NextResponse("Not found", { status: 404 });
  }

  const redisProgress = Number(await redis.get(`status:${id}`));
  const percent = Number.isFinite(redisProgress) && redisProgress > 0
    ? redisProgress
    : video.progress;

  return NextResponse.json({ percent, status: video.status });
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!isWorkerAuthorized(req)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  let body: z.infer<typeof workerStatusSchema>;
  try {
    body = workerStatusSchema.parse(await req.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const video = await db.video.findUnique({ where: { id } });
  if (!video) {
    return new NextResponse("Not found", { status: 404 });
  }

  const progress = body.progress ?? (
    body.status === "done" ? 100 : body.status === "failed" ? video.progress : 0
  );

  await db.video.update({
    where: { id },
    data: {
      status: body.status,
      progress,
    },
  });

  await redis.set(`status:${id}`, progress, {
    ex: 60 * 60 * 24,
  });

  return NextResponse.json({ ok: true });
}
