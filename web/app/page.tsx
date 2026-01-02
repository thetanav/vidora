import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const stats = [
  { title: "99.95%", desc: "Playback uptime" },
  { title: "HLS + MP4", desc: "Smooth and affordable transcoding" },
  { title: "Global CDN", desc: "R2 powered hosting" },
];

const featureCards = [
  {
    title: "Uploads that just work",
    desc: "Start from a polished UI and a pipeline ready for real files.",
  },
  {
    title: "A dashboard your team loves",
    desc: "Track jobs, status, and playback links without duct tape.",
  },
  {
    title: "These all fake so beaware",
    desc: "Sane styling, accessible components, and clean routes.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute bottom-[-220px] right-[-160px] h-[620px] w-[620px] rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_20%,rgba(255,255,255,0.07),transparent)]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16 lg:py-20">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">
              vidora
            </span>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/home">Open dashboard</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/home">Get started</Link>
            </Button>
          </nav>
        </header>

        <section className="mt-12 grid items-start gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6 lg:pt-2">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/30 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="size-1.5 rounded-full bg-primary" />
              <span>
                Realtime uploads • Auto-transcoding • Shareable playback
              </span>
            </div>

            <h1 className="mt-6 max-w-xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Video infrastructure that feels like a product.
            </h1>

            <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
              Upload, transcode, manage, and deliver beautiful playback
              experiences—from a clean, fast dashboard.
            </p>

            <div className="mt-8 flex gap-3 sm:items-center">
              <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                <Link href="/home">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/home">See it in action</Link>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 rounded-2xl border bg-card/20 p-4 backdrop-blur sm:gap-4 sm:p-5">
              {stats.map((item) => (
                <div key={item.title} className="text-center">
                  <div className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {item.title}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-2xl border bg-card/20 p-4 backdrop-blur">
              <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(99,102,241,0.22),transparent)]" />

              <div className="relative rounded-xl border bg-background/35 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    1080p • 6.2 Mbps
                  </span>
                </div>

                <div className="mt-5 aspect-video overflow-hidden rounded-lg border bg-gradient-to-br from-muted/40 to-muted/10">
                  <div className="grid h-full place-items-center">
                    <div className="rounded-full border bg-card/40 p-4 backdrop-blur">
                      <div className="size-10 rounded-full bg-primary/25" />
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border bg-card/25 p-4">
                    <div className="text-xs text-muted-foreground">
                      Pipeline
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      Upload → Transcode → Playback
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-3/4 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="rounded-xl border bg-card/25 p-4">
                    <div className="text-xs text-muted-foreground">
                      Security
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      Signed URLs • Access control
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-md border bg-background/50 px-2 py-1 text-xs text-muted-foreground">
                        JWT
                      </span>
                      <span className="rounded-md border bg-background/50 px-2 py-1 text-xs text-muted-foreground">
                        DRM-ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { title: "Fast uploads", desc: "Chunked + resumable" },
                  { title: "Auto thumbnails", desc: "Poster frames" },
                  { title: "Analytics", desc: "Watch-time + QoE" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border bg-card/20 p-4">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 border-t pt-10 sm:mt-16 sm:pt-12">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-4 md:grid-cols-3">
              {featureCards.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border bg-card/15 p-6 backdrop-blur">
                  <div className="text-base font-semibold tracking-tight">
                    {item.title}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border bg-card/15 p-6 backdrop-blur sm:flex-row sm:items-center">
              <div>
                <div className="text-base font-semibold tracking-tight">
                  Ready to ship?
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Jump into the dashboard and upload your first video.
                </div>
              </div>
              <Button asChild size="lg">
                <Link href="/home">Go to /home</Link>
              </Button>
            </div>
          </div>
        </section>

        <footer className="mt-14 flex flex-col gap-3 border-t pt-8 text-xs text-muted-foreground sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Muxboard</span>
          <div className="flex gap-4">
            <Link className="hover:text-foreground" href="/home">
              Dashboard
            </Link>
            <Link className="hover:text-foreground" href="/home">
              Upload
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
