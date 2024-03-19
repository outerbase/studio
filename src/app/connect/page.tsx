import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { PropsWithChildren } from "react";
import ConnectionList from "./connection-list";
import { getSessionFromCookie } from "@/lib/auth";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LibSQL Studio - Fast and powerful LibSQL client on your browser",
  description:
    "LibSQL Studio - Fast and powerful LibSQL client on your browser",
};

function TabContainer({ children }: Readonly<PropsWithChildren>) {
  return (
    <div className="bg-gray-100 flex">
      <div className="w-8 border-b border-gray-300"></div>
      {children}
      <div className="border-b border-gray-300 grow"></div>
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
      ? "bg-white border-b border-white border-t border-t-gray-300 border-x border-x-gray-300"
      : "border-b border-gray-300"
  );

  return <div className={className}>{text}</div>;
}

export default async function Home() {
  const { user } = await getSessionFromCookie();

  let header = (
    <div className="px-8 py-4 bg-gray-100">
      <h2 className="text-xl font-semibold mb-2">Welcome, Guest</h2>
      <Link href="/login">
        <Button>Sign In</Button>
      </Link>
    </div>
  );

  if (user) {
    header = (
      <div className="px-8 py-4 bg-gray-100">
        <h2 className="text-xl font-semibold mb-2">Welcome, {user.name}</h2>
        <Link href="/logout">
          <Button>Sign Out</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {header}

      <TabContainer>
        <TabItem text="Connections" active />
      </TabContainer>

      <ConnectionList user={user} />
    </div>
  );
}
