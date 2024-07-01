import { getSessionFromCookie } from "@/lib/auth";
import { PropsWithChildren } from "react";
import TopbarProfile from "./topbar-profile";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";

async function Topbar() {
  const { user } = await getSessionFromCookie();

  return (
    <header className="border-b">
      <div className="mx-auto container flex">
        <Link href="/">
          <h1 className="text-lg p-2">
            LibSQL <strong>Studio</strong>
          </h1>
        </Link>
        <div className="grow flex items-center ml-3">
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link
                  href="/playground"
                  passHref
                  className={navigationMenuTriggerStyle()}
                >
                  Playground
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
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
      <div className="mx-auto container flex">
        <div className="flex-grow">
          <ul className="flex gap-4 mb-2">
            <li>
              <Link href="/terms" className="font-semibold hover:underline">
                Terms and Condition
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="font-semibold hover:underline">
                Privacy
              </Link>
            </li>
          </ul>

          <p>© 2024 Visal .In. | LibSQL Studio</p>
        </div>

        <div className="flex gap-4">
          <Link href="https://x.com/libsqlstudio" target="blank">
            <img
              src="/social/twitter.svg"
              className="w-6 h-6"
              alt="libsql studio twitter"
            />
          </Link>

          <Link href="https://github.com/invisal/libsql-studio" target="blank">
            <img
              src="/social/github.svg"
              className="w-6 h-6"
              alt="libsql studio github"
            />
          </Link>
        </div>
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
