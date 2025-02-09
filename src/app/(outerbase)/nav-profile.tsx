import { Avatar } from "@/components/orbit/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Gear, SignOut, ToggleLeft, ToggleRight } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useSession } from "./session-provider";

export default function NavigationProfile() {
  const { resolvedTheme, forcedTheme, setTheme } = useTheme();
  const { session } = useSession();
  const router = useRouter();

  const theme = forcedTheme ?? resolvedTheme;

  const onLogoutClicked = useCallback(() => {
    // Remove all the session data
    localStorage.removeItem("session");
    localStorage.removeItem("ob-token");
    router.push("/signin");
  }, [router]);

  const onThemeToggleClicked = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setTheme(theme === "dark" ? "light" : "dark");

      // We don't want the dropdown to close
      e.stopPropagation();
      e.preventDefault();
    },
    [theme, setTheme]
  );

  if (!session?.user) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <Avatar size="lg" username={session.user.initials} as="div" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <div className="flex gap-2 p-2">
          <Avatar size="lg" username={session.user.initials} />

          <div className="flex flex-col justify-center">
            <div className="text-sm font-semibold">
              {session.user.first_name + " " + session.user.last_name}
            </div>
            <div className="text-sm">{session.user.email}</div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-between">
          Account Setting
          <Gear size={20} />
        </DropdownMenuItem>
        <DropdownMenuItem
          className="justify-between"
          onClick={onThemeToggleClicked}
        >
          Theme
          {theme === "dark" ? (
            <ToggleRight weight="fill" size={20} />
          ) : (
            <ToggleLeft size={20} />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onLogoutClicked} className="justify-between">
          Log out <SignOut size={20} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
