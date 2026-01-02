"use client";

import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

export default function Player({ id }: { id: string }) {
  const [r2Url, setR2Url] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/sw/${id}`);
      const data = await res.json();
      setR2Url(data.url);
    };
    fetchData();
  }, []);

  if (!r2Url)
    return (
      <div className="h-[60vh] rounded-xl bg-muted-foreground w-full flex items-center justify-center">
        Loading...
      </div>
    );

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
