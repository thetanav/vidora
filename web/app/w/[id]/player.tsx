"use client";

import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

export default function Player({ id }: { id: string }) {
  const [r2Url, setR2Url] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/sw/${id}`);
        const data = await res.json();
        setR2Url(data.url);
      } catch (error) {
        console.error("Failed to fetch video URL:", error);
      }
    };
    fetchData();
  }, [id]);

  if (r2Url !== "") {
    return (
      <ReactPlayer
        src={r2Url}
        playing={false}
        controls
        width="100%"
        height="60vh"
      />
    );
  }
}
