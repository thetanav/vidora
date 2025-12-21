import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: "https://enhanced-mollusk-12309.upstash.io",
    token: "ATAVAAIncDI0NjkwMzI3ODEwZjQ0YTE1YjJlZGQyZWVkNDRhODBiMHAyMTIzMDk",
});

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

    fs.writeFileSync(masterPath, content);
}

async function processJob(name, ext) {
    const inputPath = path.join("/tmp", `${name}.${ext}`);
    const outputDir = path.join("/output", name);

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

        console.log(`Successfully processed ${name}`);
        await redis.lpush("video-processed", JSON.stringify({ name, ext }));

    } catch (error) {
        console.error(`Error processing ${name}:`, error.message);
        await redis.lpush("video-crashed", JSON.stringify({ name, ext, error: error.message }));
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
            console.error(">> Error processing job");
        }
    }
}

setInterval(async () => await main(), 60 * 1000);