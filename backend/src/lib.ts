import path from "path";
import { mkdir } from "fs/promises";

export async function processVideo(
  queue: {
    name: string;
    ext: string;
  }[]
) {
  const job = queue[0];
  if (!job) return;

  const { name, ext } = job;
  console.log("Processing file:", name);

  const inputPath = path.join(process.cwd(), "tmp", `${name}.${ext}`);

  const outputDir = path.join(process.cwd(), "output", name);

  const playlistPath = path.join(outputDir, "index.m3u8");

  // ✅ ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  // now remove from queue
  queue.shift();

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

    queue.push({ name, ext });
    return;
  }

  await Bun.file(inputPath).delete();
  console.log("Processing complete:", name);
}
