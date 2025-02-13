import { Avatar } from "@/components/orbit/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  CaretDown,
  Gear,
  SignOut,
  ToggleLeft,
  ToggleRight,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useSession } from "./session-provider";
import { useWorkspaces } from "./workspace-provider";

export default function SidebarProfile() {
  const { currentWorkspace } = useWorkspaces();
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

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <div
          className={cn(
            buttonVariants({
              size: "lg",
              variant: "ghost",
            }),
            "flex items-center justify-start gap-2 p-1"
          )}
        >
          <Avatar username="Guest" as="div" />
          <div className="flex-1 text-left text-sm">Guest</div>
          <div>
            <CaretDown weight="bold" className="h-3 w-3" />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px]">
        <div className="flex gap-2 border-b p-2">
          <Avatar size="lg" username={session?.user?.initials ?? "Guest"} />

          <div className="flex flex-col justify-center">
            <div className="text-sm font-semibold">
              {session
                ? session.user.first_name + " " + session?.user.last_name
                : "Guest"}
            </div>
            {session && <div className="text-sm">{session.user.email}</div>}
          </div>
        </div>

        <div className="p-2">
          {session && (
            <DropdownMenuItem
              className="justify-between"
              onClick={() => {
                router.push(`/w/${currentWorkspace?.short_name}/account`);
              }}
            >
              Account Setting
              <Gear size={20} />
            </DropdownMenuItem>
          )}
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
          {session && (
            <DropdownMenuItem
              onClick={onLogoutClicked}
              className="justify-between"
            >
              Log out <SignOut size={20} />
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
