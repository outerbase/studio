import { cn } from "@/lib/utils";
import {
  Circle,
  Database,
  DotsThreeVertical,
  Triangle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { PropsWithChildren, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { BoardVisual } from "./visual";

export interface ResourceCardProps {
  className?: string;
  href: string;
  status?: string;
  statusType?: "error" | "info" | "success";
  title?: string;
  subtitle?: string;
  color?: string;
  visual?: React.FC<React.SVGProps<SVGSVGElement>>;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export default function ResourceCard({
  className,
  color,
  href,
  status,
  title,
  subtitle,
  icon: IconComponent = Database,
  visual: VisualComponent = BoardVisual,
  children,
}: PropsWithChildren<ResourceCardProps>) {
  const [open, setOpen] = useState(false);

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-36 w-[302px] flex-col justify-between overflow-hidden rounded-md border border-neutral-200 bg-white p-3.5 hover:border-neutral-300 focus:outline-none focus:*:opacity-100 focus-visible:ring focus-visible:ring-blue-600 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700/75",
        className
      )}
    >
      {/* content */}
      <header className="z-10 flex items-center gap-3">
        <div
          className={cn(
            "relative flex size-10 shrink-0 items-center justify-center rounded bg-linear-to-br after:absolute after:size-full after:rounded after:border after:border-black/5 dark:after:border-white/10",
            {
              "from-neutral-200 to-neutral-50 dark:from-neutral-700 dark:to-neutral-700/0":
                color === "default",

              "from-amber-500/20 to-orange-500/5 text-orange-500 dark:from-amber-800/50 dark:to-orange-800/10 dark:text-orange-300":
                color === "orange" || color === "yellow",

              "from-red-500/20 to-red-500/5 text-red-500 dark:from-red-800/50 dark:to-red-800/10 dark:text-red-300":
                color === "red",

              "from-green-500/20 to-teal-500/5 text-teal-500 dark:from-green-800/50 dark:to-teal-800/10 dark:text-emerald-300":
                color === "green",

              "from-blue-500/20 to-indigo-500/5 text-blue-500 dark:from-blue-800/50 dark:to-indigo-800/10 dark:text-blue-300":
                color === "blue",

              "from-fuchsia-500/30 via-teal-500/30 to-yellow-500/30 *:mix-blend-overlay dark:from-fuchsia-800/50 dark:via-teal-800/50 dark:to-yellow-800/50":
                color === "rainbow",
            }
          )}
        >
          {IconComponent && <IconComponent className="h-6 w-6" />}
        </div>
        <div className="flex-1 overflow-x-hidden">
          <p className="line-clamp-1 w-full text-sm font-semibold tracking-tight">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs font-medium text-neutral-400">{subtitle}</p>
          )}
        </div>
      </header>

      {/* status */}
      <div
        className={cn(
          "z-10 flex items-center gap-1.5 text-xs text-neutral-500",
          {
            "text-teal-700 dark:text-teal-600": status === "success",
            "text-orange-700 dark:text-orange-600": status === "error",
          }
        )}
      >
        {status === "success" ? (
          <Circle weight="fill" />
        ) : status === "error" ? (
          <Triangle weight="fill" />
        ) : null}

        <p>{status}</p>
      </div>

      {VisualComponent && <VisualComponent />}

      <div
        className={cn(
          "absolute right-0 bottom-0 z-[2] h-full w-1/2 bg-gradient-to-br mix-blend-hue",
          {
            "from-white to-white": color === "default",
            "from-yellow-500 to-red-500":
              color === "orange" || color === "yellow" || color === "red",
            "from-emerald-500 to-teal-500": color === "green",
            "from-sky-500 to-indigo-500": color === "blue",
            "from-fuchsia-500 via-sky-500 to-yellow-500": color === "rainbow",
          }
        )}
      />

      {children && (
        <DropdownMenu modal={false} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className={cn(
                "absolute top-2 right-2 z-10 flex size-8 cursor-pointer items-center justify-center rounded border border-neutral-200 bg-white opacity-0 duration-100 group-hover:opacity-100 hover:bg-neutral-50 focus:opacity-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-600 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800",
                { "opacity-100": open }
              )}
            >
              <DotsThreeVertical size={18} weight="bold" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {children}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Link>
  );
}
