"use client";

import { signIn, signOut, useSession } from "@/lib/auth-client";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function AuthButton() {
  const { data: session, isPending, isRefetching } = useSession();

  if (isPending || isRefetching) {
    return (
      <Button size="icon" variant="ghost" disabled>
        <span className="sr-only">Loading</span>
      </Button>
    );
  }

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full cursor-pointer flex items-center justify-between overflow-clip hover:bg-accent rounded-md outline-none select-none">
            <div className="flex flex-col items-start">
              <h2>{session.user?.name!}</h2>
              <h2 className="text-muted-foreground text-sm text-ellipsis">
                {session.user?.email!}
              </h2>
            </div>
            <img
              src={session.user?.image ?? ""}
              className="w-9 h-9 rounded-full"
              alt="User avatar"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() =>
                signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = "/";
                    },
                  },
                })
              }>
              Logout
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      className="w-full"
      size={"lg"}
      onClick={async () =>
        await signIn.social({
          provider: "google",
          callbackURL: "/home",
        })
      }>
      Signin with Google
    </Button>
  );
}
