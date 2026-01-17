"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/page-shell";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Home page error:", error);
  }, [error]);

  return (
    <PageShell title="Videos" description="Error">
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-destructive/50 p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Something went wrong</h3>
          <p className="text-sm text-muted-foreground">
            Failed to load videos. Please try again.
          </p>
        </div>
        <Button onClick={reset} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </PageShell>
  );
}
