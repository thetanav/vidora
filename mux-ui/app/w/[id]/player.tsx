"use client";

import ReactPlayer from "react-player";

export default function Player({ id }: { id: string }) {
  return (
    <ReactPlayer
      src={`http://localhost:3000/data/${id}/index.m3u8`}
      playing={false}
      controls
      width="100%"
      height="60vh"
      className="rounded-xl overflow-auto bg-black"
    />
  );
}
