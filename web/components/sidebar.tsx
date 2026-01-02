"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Play,
  Activity,
  MessageSquare,
  LayoutDashboard,
  Upload,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || (pathname.startsWith(path) && path !== "/");
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <Link href="/home" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/20">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-foreground text-lg tracking-tight">
            vidora
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <Link
          href="/home"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
            isActive("/home")
              ? "bg-primary text-primary-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}>
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-sm">Videos</span>
        </Link>

        <Link
          href="/tasks"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
            isActive("/tasks")
              ? "bg-primary text-primary-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}>
          <Activity className="w-4 h-4" />
          <span className="text-sm">Tasks</span>
        </Link>

        <Link
          href="/upload"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
            isActive("/upload")
              ? "bg-primary text-primary-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}>
          <Upload className="w-4 h-4" />
          <span className="text-sm">Upload</span>
        </Link>

        <Link
          href="/feedback"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
            isActive("/feedback")
              ? "bg-primary text-primary-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}>
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">Feedback</span>
        </Link>
      </nav>
    </aside>
  );
}
