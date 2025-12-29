import { VideoInfo } from "@/app/components/video-info";
import Player from "./player";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="max-w-7xl mx-auto p-4">
      <Link href="/">Back</Link>
      <Player id={id} />
      <VideoInfo id={id} />
    </div>
  );
}
