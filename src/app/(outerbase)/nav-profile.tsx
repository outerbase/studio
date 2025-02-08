import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "./session-provider";

export default function NavigationProfile() {
  const { session } = useSession();

  if (!session?.user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="bg-secondary text-secondary-foreground flex size-9 items-center justify-center rounded-lg border text-sm font-semibold">
          {session.user.initials}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <div className="flex gap-2 p-2">
          <Avatar>
            <AvatarFallback>{session.user.initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center">
            <div className="text-xs font-semibold">
              {session.user.first_name + " " + session.user.last_name}
            </div>
            <div className="text-xs">{session.user.email}</div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Account Setting</DropdownMenuItem>
        <DropdownMenuItem>Theme</DropdownMenuItem>
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
