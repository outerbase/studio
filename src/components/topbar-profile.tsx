"use client";
import { User } from "lucia";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LucideDatabase } from "lucide-react";
import Link from "next/link";

export default function TopbarProfile({ user }: Readonly<{ user: User }>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex gap-2 items-center">
          <Avatar className="h-7 w-7 text-xs">
            <AvatarFallback>
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block">{user.name}</span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <Link href="/connect">
          <DropdownMenuItem>
            <LucideDatabase className="w-4 h-4 mr-2" />
            Launch Studio
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />

        <Link href="/logout">
          <DropdownMenuItem inset>Logout</DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
