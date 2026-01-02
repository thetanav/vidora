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

app.post("/status/:id", async (c) => {
  const { id } = c.req.param();
  const { status } = await c.req.json();

  await db.video.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  return c.status(201);
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
  const { id } = c.req.json();

  await db.video.delete({
    where: {
      id,
    },
  });

  return c.json({
    message: "Video deleted",
  });
});

export const GET = handle(app);
export const POST = handle(app);
