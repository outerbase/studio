import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReactElement } from "react";

interface SidebarMenuItemProps {
  text: string;
  badge?: ReactElement;
  onClick?: () => void;
  href?: string;
  selected?: boolean;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

interface SidebarMenuHeader {
  text: string;
}

export function SidebarMenuLoadingItem() {
  const className =
    "flex p-2 pl-4 text-sm hover:cursor-pointer h-8 items-center";

  return (
    <div className={className}>
      <span className="mr-2 h-4 w-4">
        <span className="bg-muted inline-flex h-4 w-4 animate-pulse rounded-full"></span>
      </span>
      <span className="flex flex-1 items-center text-left">
        <span className="bg-muted mr-5 inline-flex h-3 w-full animate-pulse rounded-sm"></span>
      </span>
    </div>
  );
}

export function SidebarMenuItem({
  text,
  onClick,
  icon: IconComponent,
  badge,
  href,
  selected,
}: SidebarMenuItemProps) {
  const className =
    "flex p-2 pl-4 text-sm hover:cursor-pointer hover:bg-secondary h-8 items-center";

  const body = (
    <>
      {IconComponent ? (
        <IconComponent className="mr-2 h-4 w-4" />
      ) : (
        <span className="mr-2 h-4 w-4"></span>
      )}

      <span className="flex-1 text-left">{text}</span>

      {badge && badge}
    </>
  );

  if (href) {
    if (href.startsWith("https://")) {
      return (
        <Link
          href={href}
          className={cn(className, selected ? "bg-selected" : "")}
          target="_blank"
        >
          {body}
        </Link>
      );
    }

    return (
      <Link
        href={href}
        className={cn(className, selected ? "bg-selected" : "")}
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      className={cn(className, selected ? "bg-selected" : "")}
      onClick={onClick}
    >
      {body}
    </button>
  );
}

export function SidebarMenuHeader({ text }: SidebarMenuHeader) {
  return <div className="mt-2 flex p-2 pl-4 text-sm font-bold">{text}</div>;
}
