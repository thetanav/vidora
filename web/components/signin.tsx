"use client";

import { signIn, signOut, useSession } from "next-auth/react";

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
  const { data: session, status } = useSession();

  if (status === "loading") {
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
          <button className="w-full cursor-pointer mx-2 border rounded-xl py-2 px-3 flex items-center justify-between overflow-clip hover:bg-accent outline-none select-none">
            <div className="flex flex-col items-start">
              <h2>{session.user?.name!}</h2>
              <h2 className="text-muted-foreground text-sm text-ellipsis">{session.user?.email!}</h2>
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
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={() => signIn("google", { callbackUrl: "/home" })}>
      Signin with Google
    </Button>
  );
} 