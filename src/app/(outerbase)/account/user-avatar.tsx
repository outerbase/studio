import { Button } from "@/components/orbit/button";
import { OuterbaseAPIUser } from "@/outerbase-cloud/api-type";
import Image from "next/image";

export default function UserAvatar({ user }: { user: OuterbaseAPIUser }) {
  // not implement upload user avatar

  return (
    <div className="flex items-center gap-5">
      <div className="flex size-24 items-center justify-center rounded-full bg-neutral-200 text-center dark:bg-neutral-800">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt="User Avatar"
            fill
            className="rounded-full object-cover"
          />
        ) : (
          <span className="text-4xl">{user.initials}</span>
        )}
      </div>
      <Button title="Add Avatar" size="lg" />
    </div>
  );
}
