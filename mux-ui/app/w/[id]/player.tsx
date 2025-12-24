"use client";

import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

import "videojs-contrib-quality-levels";
import "videojs-hls-quality-selector";

export default function Player({ id }: { id: string }) {
  const videoRef: any = useRef(null);
  const playerRef: any = useRef(null);

  useEffect(() => {
    if (!playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        responsive: false,
        fluid: false,
        autoplay: false,
        preload: "auto",
        sources: [
          {
            src: `http://localhost:3000/data/${id}/index.m3u8`,
            type: "application/x-mpegURL",
          },
        ],
      });

      playerRef.current.hlsQualitySelector({
        displayCurrentQuality: true,
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [id]);

  return (
    <div className="w-108">
      <video ref={videoRef} className="video-js vjs-default-skin" />
    </div>
  );
}
