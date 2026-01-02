import Player from "./player";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import { ArrowLeft, ThumbsUp, ThumbsDown, Link2, Share2 } from "lucide-react";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await db.video.findUnique({
    where: {
      id,
    },
  });

  if (!video) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white fill-white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="text-gray-900">YUX</span>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </nav>

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="">
            <div className="lg:col-span-2">
              <div className="rounded-xl overflow-hidden bg-black shadow-lg">
                <Player id={id} />
              </div>

              <div className="mt-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {video.title}
                </h1>
                {video.description && (
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {video.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/per1.png"
                      alt="Tanav Poswal"
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-gray-200"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Tanav Poswal
                      </h3>
                      <p className="text-sm text-gray-500">12.3M subscribers</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="secondary" className="gap-2">
                      <ThumbsUp className="w-4 h-4" />
                      {video.likes || 0}
                    </Button>
                    <Button variant="secondary" className="px-3">
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                    <Button variant="secondary" className="px-3">
                      <Link2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">
                      {video.views || 0} views
                    </span>
                    <span className="mx-2">·</span>
                    <span>Dec 30, 2025</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
