import Sidebar from "@/components/sidebar";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <div className="flex h-screen bg-background">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  </div>
}
