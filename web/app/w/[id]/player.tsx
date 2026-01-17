"use client";

import { useEffect, useState } from "react";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

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
      <MediaPlayer title="vidora player" src={r2Url} className="w-full h-full">
        <MediaProvider />
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    );
  }
}
