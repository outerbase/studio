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
        <Link href={href} className={className} target="_blank">
          {body}
        </Link>
      );
    }

    return (
      <Link href={href} className={className}>
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
