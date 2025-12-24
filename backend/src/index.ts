import { Hono } from "hono";
import { cors } from "hono/cors";
import { compress } from "hono/compress";
import { serveStatic } from "hono/bun";
import { video } from "./routes/video";

const app = new Hono();

app.use(cors({ origin: "*" }));
// app.use(compress());
app.route("/video", video);
app.get(
  "/data/*",
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => path.replace(/^\/data/, "/output"),
  })
);
// app.use("*.m3u8", compress());

Bun.serve({
  fetch: app.fetch,
  port: 3000,
  maxRequestBodySize: 1024 * 1024 * 1024,
});

console.log("Server running on port 3000");
