"use client";

import { auth, signIn, signOut } from "@/auth"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default async function AuthButton() {
  const session = await auth()

  if (session) {
    return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={"icon"} variant={"ghost"} className="cursor-pointer">
          <img src={session.user?.image!} className="w-8 h-8 rounded-full" alt="User avatar" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" asChild>
            <button
              type="submit"
              onClick={() => signOut()}
              className="w-full px-px py-px text-start cursor-pointer"
            >
              Logout
            </button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  }

  return (
    <Button onClick={() => signIn("google", { redirectTo: "/home" })} type="submit">Signin with Google</Button>
  )
} 