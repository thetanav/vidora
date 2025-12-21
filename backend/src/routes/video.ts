import Elysia from "elysia";
import { z } from "zod";
import { nanoid } from "nanoid";
import path from "path";
import { redis } from "../../lib/redis";

export const video = new Elysia({ prefix: "/video" })
  .post(
    "/upload",
    async ({ body }) => {
      const { video } = body;
      const extension = video.name.split(".").pop()!;
      const filename = nanoid(9);

      const filePath = path.join("tmp/", filename + "." + extension);

      const file = Bun.file(filePath);
      const writer = file.writer();

      const reader = video.stream().getReader();

      let total = 0;
      const MAX = 500 * 1024 * 1024;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        total += value.length;
        if (total > MAX) {
          writer.end();
          throw new Error("File too large");
        }

        writer.write(value);
      }

      writer.end();

      await redis.lpush(
        "video-queue",
        JSON.stringify({ name: filename, ext: extension })
      );

      return {
        message: "Upload successful",
        id: filename,
      };
    },
    {
      body: z.object({
        // title: z.string(),
        // description: z.string(),
        // tags: z.array(z.string()),
        video: z
          .instanceof(File)
          .refine((file) => file.size <= 500 * 1024 * 1024, {
            message: "Max file size is 500MB",
          })
          .refine(
            (file) =>
              ["video/mp4", "video/webm", "video/mkv"].includes(file.type),
            {
              message: "Unsupported video format",
            }
          ),
      }),
      response: z.object({
        message: z.string(),
        id: z.string(),
      }),
    }
  )
  .get("/:id", ({ params }) => {});
