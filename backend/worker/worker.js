import { createClient } from "redis"
import { spawn } from "child_process"
import fs from "fs"
import path from "path"

const redis = createClient({ url: "rediss://default:ATAVAAIncDI0NjkwMzI3ODEwZjQ0YTE1YjJlZGQyZWVkNDRhODBiMHAyMTIzMDk@enhanced-mollusk-12309.upstash.io:6379" })
await redis.connect()

while (true) {
    const job = await redis.brPop("video-queue", 0)
    const { name, ext } = await JSON.parse(job.element)

    const outputDir = `/output/${name}`

    const playlistPath = path.join(outputDir, "index.m3u8");

    fs.mkdirSync(outputDir, { recursive: true })

    const ffmpeg = spawn("ffmpeg", [
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
    ],)

    ffmpeg.on("exit", async (code) => {
        if (exitCode !== 0) {
            console.error("FFmpeg error:\n", stderrText);

            await redis.lpush("video-crashed", JSON.stringify({ name, ext }));
            return;
        }
        console.log(`Job ${videoId} finished with ${code}`)
    })
}
