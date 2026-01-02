import { spawn, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
import { PutObjectCommand } from "@aws-sdk/client-s3";

dotenv.config();

const redis = Redis.fromEnv();

import { S3Client } from "@aws-sdk/client-s3";
import fetch from "node-fetch";

export const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const tmpDir = "tmp";

const resolutions = [
    { name: "240p", height: 240, bitrate: "400k" },
    { name: "480p", height: 480, bitrate: "800k" },
    { name: "720p", height: 720, bitrate: "1400k" },
    { name: "1080p", height: 1080, bitrate: "2800k" },
];

async function encodeResolution(inputPath, outputDir, resolution) {
    return new Promise((resolve, reject) => {
        const playlistPath = path.join(outputDir, `${resolution.name}.m3u8`);
        const segmentPattern = path.join(outputDir, `${resolution.name}_%03d.ts`);

        const ffmpeg = spawn("ffmpeg", [
            "-y",
            "-i", inputPath,
            "-vf", `scale=-2:${resolution.height}`,
            "-c:v", "libx264",
            "-b:v", resolution.bitrate,
            "-maxrate", resolution.bitrate,
            "-bufsize", `${parseInt(resolution.bitrate) * 2}k`,
            "-c:a", "aac",
            "-b:a", "128k",
            "-hls_time", "10",
            "-hls_playlist_type", "vod",
            "-hls_segment_filename", segmentPattern,
            "-start_number", "0",
            playlistPath,
        ]);

        ffmpeg.on("exit", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`ffmpeg exited with code ${code}`));
            }
        });

        ffmpeg.on("error", (err) => {
            reject(err);
        });
    });
}

function createMasterPlaylist(outputDir, name) {
    const masterPath = path.join(outputDir, "index.m3u8");
    let content = "#EXTM3U\n#EXT-X-VERSION:3\n";

    resolutions.forEach((res) => {
        const bandwidth = parseInt(res.bitrate) * 1000;
        content += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=1920x${res.height}\n`;
        content += `${res.name}.m3u8\n`;
    });

    fs.writeFileSync(masterPath, content); // write to name/index.m3u8
}

// TODO: fix connection timeout
export async function downloadUploadThing(url, outPath) {
    console.log(`Fetching from URL: ${url}`);

    // Use curl for more reliable downloads (handles redirects, timeouts better)
    try {
        execSync(`curl -L --fail -o "${outPath}" "${url}"`, {
            stdio: 'inherit'
        });
    } catch (error) {
        throw new Error(`Download failed: ${error.message}`);
    }

    // Verify the file was downloaded and is valid
    if (!fs.existsSync(outPath)) {
        throw new Error("Download failed: file not created");
    }

    const stats = fs.statSync(outPath);
    if (stats.size === 0) {
        fs.unlinkSync(outPath);
        throw new Error("Downloaded file is empty");
    }

    // Check if the downloaded file is actually HTML (error page)
    const buffer = Buffer.alloc(100);
    const fd = fs.openSync(outPath, 'r');
    fs.readSync(fd, buffer, 0, 100, 0);
    fs.closeSync(fd);
    const header = buffer.toString('utf8').toLowerCase();

    if (header.includes('<!doctype html') || header.includes('<html')) {
        fs.unlinkSync(outPath);
        throw new Error("Download failed: received HTML error page instead of video file");
    }

    console.log(`Downloaded ${stats.size} bytes to ${outPath}`);
}

async function uploadToR2(filePath, key, contentType, retries = 3) {
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
            console.error(`Upload attempt ${attempt}/${retries} failed for ${key}:`, error.message);
            if (attempt === retries) {
                throw new Error(`Failed to upload ${key} after ${retries} attempts`);
            }
            await new Promise((res) => setTimeout(res, 1000 * attempt));
        }
    }
}

function cleanup(paths) {
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
            console.error(`Cleanup failed for ${p}:`, err.message);
        }
    }
}

async function processJob(job) {
    const { name, ext, url: jobUrl } = job;
    // Use URL from job if provided, otherwise construct it
    const url = jobUrl || `https://odr537djvh.ufs.sh/f/tmp/${name}.${ext}`;
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
        }

        // Create master playlist
        createMasterPlaylist(outputDir, name);

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
            console.log(`Successfully processed ${name}`);
        } catch (error) {
            console.error(`Error uploading to R2:`, error.message);
        }
    } catch (error) {
        console.error(`Error processing ${name}:`, error.message);
        cleanup([inputPath, outputDir]);
        throw error;
    }
}

async function main() {
    console.log("Video worker started");

    const job = await redis.rpop("video-queue");
    // const job = { name: 'test', ext: 'mp4', url: 'https://example.com/video.mp4' }
    if (!job || job == null || job == undefined) {
        console.log("No job found in queue");
        return;
    } else {
        try {
            console.log(">> Job found in queue:", job);
            const { name, ext } = job;
            if (!name || !ext) {
                throw new Error("Invalid job: missing 'name' or 'ext' field");
            }
            console.log(`>> Processing video: ${name}.${ext}`);
            fetch(`${process.env.BACKEND_URL}/api/status/${name}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: "transcoding",
                }),
            });
            await processJob(job);
            fetch(`${process.env.BACKEND_URL}/api/status/${name}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: "done",
                }),
            });
            console.log(">> Job processed", job);
        } catch (error) {
            fetch(`${process.env.BACKEND_URL}/api/status/${name}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: "retry",
                }),
            });
            await redis.rpush("video-queue", job);
            console.error(">> Error processing job:", error);
        }
    }
}

main();
setInterval(async () => await main(), 60 * 1000);