import type React from "react";

interface PageShellProps {
  title: string;
  description?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageShell({
  title,
  description,
  right,
  children,
}: PageShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b bg-sidebar px-2 py-2">
        <div className="flex h-12 items-center justify-between px-6">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight">
              {title}
            </h1>
            {description ? (
              <p className="truncate text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      </header>

      <main className="flex-1 px-6 py-6">{children}</main>
    </div>
  );
}
