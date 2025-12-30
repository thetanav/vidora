import Player from "./player";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import db from "@/lib/db";
import { notFound } from "next/navigation";

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
    <div className="max-w-7xl mx-auto p-4">
      <Button asChild variant={"outline"} className="mb-3">
        <Link href="/">Back</Link>
      </Button>
      <Player id={id} />
      <div className="mt-4 mb-2">
        <h3 className="text-2xl font-bold">{video.title}</h3>
        <p className="mt-2 text-sm opacity-70">{video.description}</p>
        <div className="flex items-center justify-between mt-6">
          <div className="flex gap-2 items-center">
            <img src="/per1.png" className="w-10 h-10 rounded-full" />
            <div>
              <h3 className="font-semibold">Tanav Poswal</h3>
              <p className="text-sm opacity-70 -mt-1">12.3 M subscribers</p>
            </div>
          </div>

          <div className="flex gap-3 mr-4">
            <Button>👍 {video.likes || 0}</Button>
            <Button>👎</Button>
            <Button>🔗</Button>
          </div>
        </div>
        <div className="mt-3 text-sm opacity-70">Views: {video.views || 0}</div>
      </div>
    </div>
  );
}
