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
        <div className="pr-4 flex items-center pt-1">
          <a
            className="github-button"
            href="https://github.com/invisal/libsql-studio"
            data-color-scheme="no-preference: dark; light: light; dark: dark;"
            data-size="large"
            data-show-count="true"
            aria-label="Star invisal/libsql-studio on GitHub"
          ></a>
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
          <ul className="flex flex-wrap gap-4 mb-2">
            <li>
              <Link
                href="/playground"
                className="font-semibold hover:underline"
              >
                Playground
              </Link>
            </li>
            <li>
              <Link href="/docs" className="font-semibold hover:underline">
                Document
              </Link>
            </li>
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
          <Link href="https://x.com/invisal89" target="blank">
            <svg
              className="w-6 h-6"
              width="1200"
              height="1227"
              viewBox="0 0 1200 1227"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
                fill="currentColor"
              />
            </svg>
          </Link>

          <Link href="https://github.com/invisal/libsql-studio" target="blank">
            <svg
              width="98"
              height="96"
              viewBox="0 0 98 96"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                fill="currentColor"
              />
            </svg>
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
