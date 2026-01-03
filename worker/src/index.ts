import { spawn, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import { S3Client } from "@aws-sdk/client-s3";
import { pipeline } from "stream/promises";

dotenv.config();

const redis = Redis.fromEnv();

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const tmpDir = "tmp";

interface Resolution {
  name: string;
  height: number;
  bitrate: string;
}

const resolutions: Resolution[] = [
  { name: "240p", height: 240, bitrate: "400k" },
  { name: "480p", height: 480, bitrate: "800k" },
  { name: "720p", height: 720, bitrate: "1400k" },
  { name: "1080p", height: 1080, bitrate: "2800k" },
];

async function encodeResolution(
  inputPath: string,
  outputDir: string,
  resolution: Resolution
) {
  return new Promise<void>((resolve, reject) => {
    const playlistPath = path.join(outputDir, `${resolution.name}.m3u8`);
    const segmentPattern = path.join(outputDir, `${resolution.name}_%03d.ts`);

    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-i",
      inputPath,
      "-vf",
      `scale=-2:${resolution.height}`,
      "-c:v",
      "libx264",
      "-b:v",
      resolution.bitrate,
      "-maxrate",
      resolution.bitrate,
      "-bufsize",
      `${parseInt(resolution.bitrate) * 2}k`,
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-hls_time",
      "10",
      "-hls_playlist_type",
      "vod",
      "-hls_segment_filename",
      segmentPattern,
      "-start_number",
      "0",
      playlistPath,
    ]);

    ffmpeg.on("error", (err) => {
      reject(new Error(`ffmpeg exited with error: ${err}`));
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });
}

function createMasterPlaylist(outputDir: string) {
  const masterPath = path.join(outputDir, "index.m3u8");
  let content = "#EXTM3U\n#EXT-X-VERSION:3\n";

  resolutions.forEach((res) => {
    const bandwidth = parseInt(res.bitrate) * 1000;
    content += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=1920x${res.height}\n`;
    content += `${res.name}.m3u8\n`;
  });

  fs.writeFileSync(masterPath, content); // write to name/index.m3u8
}

export async function downloadUploadThing(url: string, outPath: string) {
  console.log(`Fetching from URL: ${url}`);

  const tempPath = `${outPath}.tmp`;

  let response;
  try {
    response = await axios.get(url, {
      responseType: "stream",
      timeout: 30_000,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 300,
      headers: {
        "User-Agent": "node-worker",
        Accept: "*/*",
      },
    });
  } catch (err: any) {
    throw new Error(`Download request failed: ${err.message}`);
  }

  const contentType = response.headers["content-type"] || "";
  if (contentType.includes("text/html")) {
    throw new Error("Download failed: received HTML instead of file");
  }

  try {
    await pipeline(response.data, fs.createWriteStream(tempPath));
  } catch (err: any) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    throw new Error(`Stream write failed: ${err.message}`);
  }

  if (!fs.existsSync(tempPath)) {
    throw new Error("Download failed: file not created");
  }

  const stats = fs.statSync(tempPath);
  if (stats.size === 0) {
    fs.unlinkSync(tempPath);
    throw new Error("Downloaded file is empty");
  }

  fs.renameSync(tempPath, outPath);

  console.log(`Downloaded ${stats.size} bytes to ${outPath}`);
}

async function uploadToR2(
  filePath: string,
  key: string,
  contentType: string,
  retries = 3
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const fileStream = fs.createReadStream(filePath);
      await r2.send(
        new PutObjectCommand({
          Bucket: "yux-videos",
          Key: key,
          Body: fileStream,
          ContentType: contentType,
        })
      );
      // console.log(`Uploaded ${key}`);
      return;
    } catch (error) {
      console.error(
        `Upload attempt ${attempt}/${retries} failed for ${key}:`,
        error
      );
      if (attempt === retries) {
        throw new Error(`Failed to upload ${key} after ${retries} attempts`);
      }
      await new Promise((res) => setTimeout(res, 1000 * attempt));
    }
  }
}

function cleanup(paths: string[]) {
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) {
        const stat = fs.statSync(p);
        if (stat.isDirectory()) {
          fs.rmSync(p, { recursive: true });
        } else {
          fs.unlinkSync(p);
        }
      }
    } catch (err) {
      console.error(`Cleanup failed for ${p}:`, err);
    }
  }
}

interface Job {
  name: string;
  ext: string;
}

async function processJob(job: Job) {
  const { name, ext } = job;

  const url = `https://odr537djvh.ufs.sh/f/tmp/${name}.${ext}`;
  const inputPath = path.join(tmpDir, `${name}.${ext}`);
  const outputDir = path.join(tmpDir, name);

  try {
    // Ensure tmp directory exists
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Download the video
    console.log(`Downloading ${name}.${ext}...`);
    await downloadUploadThing(url, inputPath);

    await redis.set("status:" + name, 10);

    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    // Create output directory
    fs.mkdirSync(outputDir, { recursive: true });

    // Encode all resolutions
    for (const resolution of resolutions) {
      console.log(`Encoding ${resolution.name}...`);
      await encodeResolution(inputPath, outputDir, resolution);
      await redis.incrby("status:" + name, 10);
    }

    // Create master playlist
    createMasterPlaylist(outputDir);
    await redis.set("status:" + name, 70);

    // Delete input file after encoding
    fs.unlinkSync(inputPath);

    try {
      // Upload the :name: folder to R2
      const files = fs.readdirSync(outputDir);
      for (const file of files) {
        const filePath = path.join(outputDir, file);
        const contentType = file.endsWith(".m3u8")
          ? "application/vnd.apple.mpegurl"
          : "video/mp2t";

        await uploadToR2(filePath, `${name}/${file}`, contentType);
      }
      console.log(`Uploaded ${name} to R2`);
      // Delete the output folder
      fs.rmSync(outputDir, { recursive: true });
      await redis.set("status:" + name, 90);
      console.log(`Successfully processed ${name}`);
    } catch (error) {
      console.error(`Error uploading to R2:`, error);
    }
  } catch (error) {
    console.error(`Error processing ${name}:`, error);
    cleanup([inputPath, outputDir]);
    throw error;
  }
}

async function main() {
  console.log("Video worker started");

  const job = await redis.rpop("video-queue");
  const { name, ext }: any = job;

  if (!job || job == null || job == undefined) {
    console.log("No job found in queue");
    return;
  } else {
    try {
      console.log(">> Job found in queue:", job);
      if (!name || !ext) {
        throw new Error("Invalid job: missing 'name' or 'ext' field");
      }
      console.log(`>> Processing video: ${name}.${ext}`);
      await redis.set("status:" + name, 0);
      await processJob({ name, ext });
      await axios.post(
        `${process.env.BACKEND_URL}/api/status/${name}`,
        {
          status: "done",
        },
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(">> Job processed", job);
    } catch (error) {
      await redis.rpush("video-queue", job);
      await redis.set("status:" + name, 0);
      console.error(">> Error processing job:", error);
    }
  }
}

let running = false;

setInterval(async () => {
  if (running) {
    console.log("Previous run still active, skipping tick");
    return;
  }

  running = true;
  try {
    await main();
  } catch (e) {
    console.error(e);
  } finally {
    running = false;
  }
}, 60_000);
