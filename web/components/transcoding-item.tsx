"use client";

import { Zap } from "lucide-react";

interface TranscodingItemProps {
  video: {
    id: string;
    title: string;
    views: number;
    likes: number;
    status: string;
    createdAt: Date;
  };
}

export default function TranscodingItem({ video }: TranscodingItemProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg mb-1">
            {video.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {new Date(video.createdAt).toDateString()}
          </p>
        </div>

        <div className="relative w-12 h-12 ml-4">
          <svg className="w-12 h-12 animate-spin-slow" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="70 180"
              className="text-primary"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm font-semibold text-primary">
            Somewhere below 100%
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
            style={{ width: `50%` }}
          />
        </div>
      </div>
    </div>
  );
}
