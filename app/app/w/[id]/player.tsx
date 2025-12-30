"use client";

import ReactPlayer from "react-player";

const R2_BASE_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

export default function Player({ id }: { id: string }) {
  const r2Url = `${R2_BASE_URL}/${id}/index.m3u8`;

  return (
    <ReactPlayer
      src={r2Url}
      playing={false}
      controls
      width="100%"
      height="60vh"
      className="rounded-xl overflow-auto bg-black"
    />
  );
}
