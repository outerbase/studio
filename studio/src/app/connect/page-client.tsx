"use client";
import { Button } from "@studio/components/ui/button";
import { cn } from "@studio/lib/utils";
import { PropsWithChildren } from "react";
import ConnectionList from "./connection-list";
import Link from "next/link";
import { LucideCopy, LucideMoon, LucideSun } from "lucide-react";
import { User } from "lucia";
import { useTheme } from "@studio/context/theme-provider";

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
        <div>Welcome, {user ? user.name : "Guest"}</div>
        {user?.id && (
          <div
            className="mt-1 cursor-pointer"
            onClick={() => {
              window.navigator.clipboard.writeText(user.id);
            }}
          >
            <span className="text-sm font-normal px-3 py-1 rounded-lg bg-background flex items-center">
              <strong className="mr-2">ID: </strong>
              {user.id} &nbsp;
              <LucideCopy className="ml-1 w-4 h-4" />
            </span>
          </div>
        )}
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
