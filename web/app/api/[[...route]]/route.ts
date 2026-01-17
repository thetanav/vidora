import { auth } from "@/auth";
import db from "@/lib/db";
import { redis } from "@/lib/redis";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";

const app = new Hono().basePath("/api");

// Note: NextAuth middleware may not reliably run for this catch-all Hono route.
// We enforce auth per-handler as needed.

const uploadSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(10_000).optional().default(""),
  id: z.string().trim().min(1),
  extension: z.string().trim().min(1).max(10),
  thumbnailUrl: z.string().url().optional().nullable(),
});

type UploadInput = z.infer<typeof uploadSchema>;

app.post("/upload", async (c) => {
  const session = await auth();

  if (!session?.user?.id) {
    return c.text("Unauthorized", 401);
  }

  let body: UploadInput;
  try {
    const json = await c.req.json();
    body = uploadSchema.parse(json);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid request", issues: error.issues }, 400);
    }
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const { title, description, id, extension, thumbnailUrl } = body;

  await db.video.create({
    data: {
      id,
      title,
      description,
      likes: 0,
      thumbnail: thumbnailUrl || null,
      userId: session.user.id,
    },
  });

  await redis.lpush("video-queue", JSON.stringify({ name: id, ext: extension }));

  return c.text("ok");
});

app.post("/status/:id", async (c) => {
  const session = await auth();
  if (!session?.user?.id) {
    return c.text("Unauthorized", 401);
  }

  const { id } = c.req.param();

  const video = await db.video.findUnique({ where: { id } });
  if (!video || video.userId !== session.user.id) {
    return c.text("Unauthorized", 401);
  }

  await db.video.update({
    where: {
      id,
    },
    data: {
      status: "done",
    },
  });

  return c.text("ok");
});

app.get("/status/:id", async (c) => {
  const { id } = c.req.param();
  const percent = Number(await redis.get(`status:${id}`)) || 0;

  return c.json({ percent });
});

// generate signed url to watch video
app.get("/sw/:id", async (c) => {
  const { id } = c.req.param();

  // await redis.incr("views:" + id);

  return c.json({
    url: `${process.env.R2_PUBLIC_URL}/${id}/index.m3u8`,
  });
});

app.post("/delete", async (c) => {
  const { id } = await c.req.json();
  const session = await auth()

  if (!session) {
    return c.text("Unauthorized", 401);
  }

  const video = await db.video.findUnique({
    where: {
      id,
    }
  });

  if (!video || video.userId !== session.user?.id) {
    return c.text("Unauthorized", 401);
  }

  await db.video.delete({
    where: {
      id,
    },
  });

  await redis.del("status:" + id);

  return c.text("ok");
});

export const GET = handle(app);
export const POST = handle(app);
