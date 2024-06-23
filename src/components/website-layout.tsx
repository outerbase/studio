import { getSessionFromCookie } from "@/lib/auth";
import { PropsWithChildren } from "react";
import TopbarProfile from "./topbar-profile";
import Link from "next/link";
import { Button } from "./ui/button";

async function Topbar() {
  const { user } = await getSessionFromCookie();

  return (
    <header className="border-b">
      <div className="mx-auto container flex">
        <h1 className="text-lg p-2">
          LibSQL <strong>Studio</strong>
        </h1>
        <div className="grow" />
        {user ? (
          <TopbarProfile user={user} />
        ) : (
          <div className="flex items-center">
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <div className="border-t py-4 text-sm">
      <div className="mx-auto container">
        © 2024 Visal .In. | LibSQL Studio
      </div>
    </div>
  );
}

export default function WebsiteLayout({ children }: PropsWithChildren) {
  return (
    <main>
      <Topbar />
      {children}
      <Footer />
    </main>
  );
}
