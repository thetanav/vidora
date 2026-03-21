"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface WatchClientProps {
  videoId: string;
  isReady: boolean;
}

export default function WatchClient({ videoId, isReady }: WatchClientProps) {
  const [streamUrl, setStreamUrl] = useState("");

  useEffect(() => {
    const viewedKey = `vidora:viewed:${videoId}`;
    if (sessionStorage.getItem(viewedKey)) {
      return;
    }

    void fetch(`/api/videos/${videoId}/view`, {
      method: "POST",
    }).then(() => {
      sessionStorage.setItem(viewedKey, "1");
    });
  }, [videoId]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void fetch(`/api/videos/${videoId}/share`, {
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to load share links");
        }

        return res.json() as Promise<{ streamUrl?: string }>;
      })
      .then((data) => {
        setStreamUrl(data.streamUrl || "");
      })
      .catch(() => {
        setStreamUrl("");
      });
  }, [isReady, videoId]);

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Watch link copied");
  };

  const copyStreamLink = async () => {
    if (!streamUrl) {
      toast.error("Stream URL is not available yet");
      return;
    }

    await navigator.clipboard.writeText(streamUrl);
    toast.success("Stream URL copied");
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={copyShareLink}>
        <Share2 className="w-4 h-4" />
        Share
      </Button>
      <Button variant="outline" onClick={copyStreamLink} disabled={!streamUrl}>
        <ExternalLink className="w-4 h-4" />
        Stream URL
      </Button>
    </div>
  );
}
