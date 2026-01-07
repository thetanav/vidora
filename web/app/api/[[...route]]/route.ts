import db from "@/lib/db";
import { redis } from "@/lib/redis";
import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api");

app.post("/upload", async (c) => {
  const { title, description, id, extension, thumbnailUrl } =
    await c.req.json();
  await db.video.create({
    data: {
      id,
      title,
      description,
      likes: 0,
      thumbnail: thumbnailUrl || null,
    },
  });

  await redis.lpush(
    "video-queue",
    JSON.stringify({ name: id, ext: extension })
  );

  return c.text("ok");
});

app.post("/status/:id", async (c) => {
  const { id } = c.req.param();

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

  await db.video.delete({
    where: {
      id,
    },
  });

  return c.text("ok");
});

export const GET = handle(app);
export const POST = handle(app);
