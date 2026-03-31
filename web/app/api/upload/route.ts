import { getSession } from "@/lib/auth-client";
import db from "@/lib/db";
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";
import { z } from "zod";

const uploadSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(10_000).optional().default(""),
  id: z.string().trim().min(1),
  extension: z.enum(["mp4", "mov", "avi", "mkv", "webm"]),
  thumbnailUrl: z.string().url().optional().nullable(),
});

type UploadInput = z.infer<typeof uploadSchema>;

export async function POST(req: Request) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let body: UploadInput;
  try {
    const json = await req.json();
    body = uploadSchema.parse(json);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", issues: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, description, id, extension, thumbnailUrl } = body;

  await db.video.create({
    data: {
      id,
      title,
      description,
      extension,
      likes: 0,
      thumbnail: thumbnailUrl || null,
      userId: session.user.id,
    },
  });

  await redis.rpush(
    "video-queue",
    JSON.stringify({ name: id, ext: extension, attempts: 0 }),
  );

  return new NextResponse("ok");
}
