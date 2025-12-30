import db from "@/lib/db";
import { redis } from "@/lib/redis";
import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api");

app.post("/upload", async (c) => {
  const { title, description, id, extension } = await c.req.json();
  await db.video.create({
    data: {
      id,
      title,
      description,
      duration: 0,
      views: 0,
      likes: 0,
    },
  });

  await redis.lpush(
    "video-queue",
    JSON.stringify({ name: id, ext: extension })
  );

  return c.json({
    message: "Upload successful",
  });
});

export const GET = handle(app);
export const POST = handle(app);
