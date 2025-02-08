import { Avatar } from "@/components/orbit/avatar";
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
        <Avatar size="lg" username={session.user.initials} as="div" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <div className="flex gap-2 p-2">
          {/* <Avatar>
            <AvatarFallback>{session.user.initials}</AvatarFallback>
          </Avatar> */}
          <Avatar size="lg" username={session.user.initials} />

          <div className="flex flex-col justify-center">
            <div className="text-sm font-semibold">
              {session.user.first_name + " " + session.user.last_name}
            </div>
            <div className="text-sm">{session.user.email}</div>
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
