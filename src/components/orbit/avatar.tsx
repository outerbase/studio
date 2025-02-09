import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type AvatarProps = {
  as?: React.ElementType;
  image?: string;
  size?: "sm" | "base" | "lg";
  toggled?: boolean;
  username: string;
};

export const Avatar = ({
  as = "button",
  image,
  size = "base",
  toggled,
  username,
}: AvatarProps) => {
  const Component = as && (as === "link" ? Link : as);

  const firstInitial = username.charAt(0).toUpperCase();

  return (
    <Component
      className={cn("ob-btn btn-secondary circular relative overflow-hidden", {
        "ob-size-sm": size === "sm",
        "ob-size-base": size === "base",
        "ob-size-lg": size === "lg",
        interactive: as === "button",
        "after:absolute after:top-0 after:left-0 after:z-10 after:size-full after:bg-black/5 after:opacity-0 after:transition-opacity hover:after:opacity-100 dark:after:bg-white/10":
          image,
        "after:opacity-100": image && toggled,
        toggle: !image && toggled,
      })}
    >
      {image ? (
        <Image
          className="w-full"
          height={size === "sm" ? 28 : size === "base" ? 32 : 36}
          width={size === "sm" ? 28 : size === "base" ? 32 : 36}
          src={image}
          alt={username}
        />
      ) : (
        <p className="text-ob-base-100 font-bold">{firstInitial}</p>
      )}
    </Component>
  );
};
