"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";
import ConnectionList from "./connection-list";
import Link from "next/link";
import { LucideMoon, LucideSun } from "lucide-react";
import { User } from "lucia";
import { useTheme } from "@/context/theme-provider";

function TabContainer({ children }: Readonly<PropsWithChildren>) {
  return (
    <div className="bg-secondary flex">
      <div className="w-8 border-b"></div>
      {children}
      <div className="border-b grow"></div>
    </div>
  );
}

function TabItem({
  active,
  text,
}: Readonly<{ active?: boolean; text: string }>) {
  const className = cn(
    "px-3 py-1",
    active
      ? "bg-background border-b border-b-background border-t border-x"
      : "border-b border-gray-300"
  );

  return <div className={className}>{text}</div>;
}

function Header({ user }: Readonly<{ user: User | null }>) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="px-8 py-4 bg-secondary flex">
      <h2 className="text-xl font-semibold mb-2">
        Welcome, {user ? user.name : "Guest"}
      </h2>
      <div className="grow" />
      <div className="flex gap-2">
        <Button size={"icon"} onClick={() => toggleTheme()}>
          {theme === "dark" ? (
            <LucideMoon className="w-4 h-4" />
          ) : (
            <LucideSun className="w-4 h-4" />
          )}
        </Button>

        {user ? (
          <Link href="/logout">
            <Button>Sign Out</Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ConnectBody({ user }: Readonly<{ user: User | null }>) {
  "use client";
  return (
    <div className="flex flex-col h-screen">
      <Header user={user} />
      <TabContainer>
        <TabItem text="Connections" active />
      </TabContainer>

      <ConnectionList user={user} />
    </div>
  );
}
