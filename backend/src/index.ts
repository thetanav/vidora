import { Hono } from "hono";
import { cors } from "hono/cors";
import { compress } from "hono/compress";
import { serveStatic } from "hono/bun";
import { video } from "./routes/video";

const app = new Hono();

app.use(cors({ origin: "http://localhost:3001" }));
// app.use(compress());
app.route("/video", video);
app.use(
  "/video/*",
  serveStatic({
    root: "./output",
    rewriteRequestPath: (path) => path.replace(/^\/video/, ""),
  })
);

Bun.serve({
  fetch: app.fetch,
  port: 3000,
  maxRequestBodySize: 1024 * 1024 * 1024,
});

console.log("Server running on port 3000");
