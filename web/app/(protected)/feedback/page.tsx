export default function Page() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Feedback
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            User feedback and support requests
          </p>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Feedback Coming Soon
          </h3>
          <p className="text-sm text-muted-foreground">
            We are working on building a comprehensive feedback system
          </p>
        </div>
      </div>
    </div>
  );
}
