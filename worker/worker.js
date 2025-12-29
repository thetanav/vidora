import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import fetch from "node-fetch";

dotenv.config();

const redis = Redis.fromEnv();

import { S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

// await r2.send(
//     new PutObjectCommand({
//         Bucket: "videos",
//         Key: "videos/abc/480p/index.m3u8",
//         Body: fs.createReadStream("./out/index.m3u8"),
//         ContentType: "application/vnd.apple.mpegurl",
//     })
// );

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
            }
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

async function processJob(name, ext) {
    // download this to tmp/
    const url = `https://odr537djvh.ufs.sh/f/tmp/${name}.${ext}`;

    const inputPath = `${name}.${ext}`

    const res = await fetch(url);
    if (!res.ok) throw new Error("Download failed");

    const stream = fs.createWriteStream(inputPath);
    await new Promise((resolve, reject) => {
        res.body.pipe(stream);
        res.body.on("error", reject);
        stream.on("finish", resolve);
    });

    const outputDir = name;

    try {
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

        fs.unlinkSync(inputPath);

        // Upload the :name: folder to R2
        const files = fs.readdirSync(outputDir);
        for (const file of files) {
            const filePath = path.join(outputDir, file);
            const contentType = file.endsWith(".m3u8")
                ? "application/vnd.apple.mpegurl"
                : "video/mp2t";

            await r2.send(
                new PutObjectCommand({
                    Bucket: "videos",
                    Key: `${name}/${file}`,
                    Body: fs.createReadStream(filePath),
                    ContentType: contentType,
                })
            );
            console.log(`Uploaded ${name}/${file}`);
        }

        // Delete the output folder
        fs.rmSync(outputDir, { recursive: true });

        console.log(`Successfully processed ${name}`);

    } catch (error) {
        console.error(`Error processing ${name}:`, error.message);
    }
}

async function main() {
    console.log("Video worker started");

    const job = await redis.rpop("video-queue");
    if (!job || job == null || job == undefined) {
        console.log("No job found in queue");
        return;
    } else {
        try {
            console.log(">> Job found in queue:", job);
            const { name, ext } = job;
            console.log(`>> Processing video: ${name}.${ext}`);
            await processJob(name, ext);
            console.log(">> Job processed", job);
        } catch (error) {
            console.error(">> Error processing job:", error.message);
        }
    }
}

setInterval(async () => await main(), 60 * 1000);