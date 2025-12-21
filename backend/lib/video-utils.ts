import path from "path";
import { mkdir } from "fs/promises";
import { redis } from "../lib/redis";

export async function processVideo() {
  const job = await redis.rpop("video-queue");
  if (!job) return;

  const { name, ext } = await JSON.parse(job);
  console.log("Processing file:", name);

  const inputPath = path.join(process.cwd(), "tmp", `${name}.${ext}`);

  const outputDir = path.join(process.cwd(), "output", name);

  const playlistPath = path.join(outputDir, "index.m3u8");

  // ✅ ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  const proc = Bun.spawn(
    [
      "ffmpeg",
      "-y",
      "-i",
      inputPath,
      "-codec:v",
      "libx264",
      "-codec:a",
      "aac",
      "-hls_time",
      "10",
      "-hls_playlist_type",
      "vod",
      "-hls_segment_filename",
      path.join(outputDir, "segment%03d.ts"),
      "-start_number",
      "0",
      playlistPath,
    ],
    {
      stderr: "pipe",
    }
  );

  const stderrText = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    console.error("FFmpeg error:\n", stderrText);

    await redis.lpush("video-queue", JSON.stringify({ name, ext }));
    return;
  }

  await Bun.file(inputPath).delete();
  console.log("Processing complete:", name);
}
