import PageShell from "@/components/page-shell";
import { MessageSquare } from "lucide-react";

export default function Page() {
  return (
    <PageShell title="Feedback" description="Share issues and suggestions">
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold">Feedback coming soon</h3>
        <p className="text-sm text-muted-foreground">
          We’re building a simple feedback flow.
        </p>
      </div>
    </PageShell>
  );
}
