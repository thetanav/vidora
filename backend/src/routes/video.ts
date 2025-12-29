import { Hono } from "hono";
import path from "path";
import { redis } from "../../lib/redis";

type VideoMeta = {
  id: string;
  title: string;
  description: string;
  ext: string;
  status: "queued" | "processing" | "ready" | "failed";
  createdAt: number;
};

const QUALITIES = ["240p", "480p", "720p", "1080p"] as const;

type PlaybackInfo = {
  master: string;
  variants: Array<{ quality: (typeof QUALITIES)[number]; path: string }>;
};

export const video = new Hono();

video.post("/upload", async (c) => {
  const { title, description, videoUrl, videoName } = await c.req.json();

  const extension = videoName.split(".").pop()!;

  await redis.lpush(
    "video-queue",
    JSON.stringify({ name: videoName, ext: extension })
  );

  return c.json({
    message: "Upload successful",
    videoName,
  });
});

video.get("/:id", async (c) => {
  const id = c.req.param("id");
  const raw = await redis.get<string>(`video:${id}`);
  if (!raw) {
    return c.json({ message: "Not found" }, 404);
  }

  const meta = JSON.parse(raw) as VideoMeta;

  const masterFile = Bun.file(path.join("output", id, "index.m3u8"));
  const isReady = await masterFile.exists();

  const variants = await Promise.all(
    QUALITIES.map(async (q) => {
      const file = Bun.file(path.join("output", id, `${q}.m3u8`));
      const exists = await file.exists();
      return exists ? { quality: q, path: `/video/${id}/${q}.m3u8` } : null;
    })
  );

  const playback: PlaybackInfo = {
    master: `/video/${id}/index.m3u8`,
    variants: variants.filter(Boolean) as PlaybackInfo["variants"],
  };

  return c.json({
    id: meta.id,
    title: meta.title,
    description: meta.description,
    status: isReady ? "ready" : meta.status,
    playback,
  });
});
