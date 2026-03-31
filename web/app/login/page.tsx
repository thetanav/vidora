import { getSession, signIn } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Link from "next/link";

export default async function LoginPage() {
  const { data } = await getSession();
  if (data?.user) redirect("/home");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500">
          <Play className="h-5 w-5 fill-white text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight">vidora</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card/50 p-8">
        <div className="text-center">
          <h1 className="text-base font-medium">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to continue
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn.social({
              provider: "google",
              callbackURL: "/home",
            });
          }}>
          <Button type="submit" className="w-full gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms and Privacy Policy
        </p>
      </div>

      <Link
        href="/"
        className="mt-6 text-sm text-muted-foreground hover:text-foreground">
        Back to home
      </Link>
    </div>
  );
}
