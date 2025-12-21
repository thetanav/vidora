import { Elysia } from "elysia";
import { video } from "./routes/video";
import { cors } from "@elysiajs/cors";
import staticPlugin from "@elysiajs/static";

const app = new Elysia().use(video);
app.use(cors({ origin: "*" }));
app.use(
  staticPlugin({
    assets: "output",
    prefix: "/video",
  })
);
app.listen(3000);
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
