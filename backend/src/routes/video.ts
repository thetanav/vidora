import { Hono } from "hono";
import { z } from "zod";
import { nanoid } from "nanoid";
import path from "path";
import { mkdir } from "node:fs/promises";
import { redis } from "../../lib/redis";
import Busboy from "busboy";
import fs from "fs";

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
  const req = c.req.raw;

  const bb = Busboy({
    headers: req.headers.toJSON(),
    limits: {
      fileSize: 1024 * 1024 * 1024, // 1GB
    },
  });

  let title;
  let description;

  await mkdir("tmp", { recursive: true });

  bb.on("field", (name, value) => {
    if (name === "title") title = value;
    if (name === "description") description = value;
  });

  let extension;
  const id = nanoid(9);

  bb.on("file", async (_name, file, info) => {
    const { filename, mimeType } = info;
    console.log(filename);
    console.log(mimeType);
    extension = filename.split(".").pop()!;
    const filePath = path.join("tmp", `${id}.${extension}`);
    const writeStream = fs.createWriteStream(filePath);
    file.pipe(writeStream);
  });

  await redis.lpush(
    "video-queue",
    JSON.stringify({ name: id, ext: extension })
  );

  return c.json({
    message: "Upload successful",
    id,
  });
});

video.get("/:id", async (c) => {
  const id = c.req.param("id");
  const raw = await redis.get<string>(`video:${id}`);
  if (!raw) {
    return c.json({ message: "Not found" }, 404);
  }

  const meta = JSON.parse(raw) as VideoMeta;

  const masterFile = Bun.file(path.join("output", id, "master.m3u8"));
  const isReady = await masterFile.exists();

  const variants = await Promise.all(
    QUALITIES.map(async (q) => {
      const file = Bun.file(path.join("output", id, `${q}.m3u8`));
      const exists = await file.exists();
      return exists ? { quality: q, path: `/data/${id}/${q}.m3u8` } : null;
    })
  );

  const playback: PlaybackInfo = {
    master: `/data/${id}/master.m3u8`,
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

video.post("/like");
