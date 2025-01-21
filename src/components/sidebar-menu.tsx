import Link from "next/link";

interface SidebarMenuItemProps {
  text: string;
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
  href,
}: SidebarMenuItemProps) {
  const className =
    "flex p-2 pl-4 text-xs hover:cursor-pointer hover:bg-secondary";

  const body = (
    <>
      {IconComponent ? (
        <IconComponent className="mr-2 h-4 w-4" />
      ) : (
        <span className="mr-2 h-4 w-4"></span>
      )}
      {text}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <button className={className} onClick={onClick}>
      {body}
    </button>
  );
}

export function SidebarMenuHeader({ text }: SidebarMenuHeader) {
  return <div className="mt-2 flex p-2 pl-4 text-xs font-bold">{text}</div>;
}
