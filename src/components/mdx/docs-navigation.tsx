"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { LucideAlignJustify } from "lucide-react";
import { usePathname } from "next/navigation";
import { DocTableContent } from "./docs";

export function DocNavigation({
  content,
  title,
}: {
  content: DocTableContent;
  title?: string;
}) {
  "use client";

  const pathname = usePathname();

  const sideMenu = (
    <div className="flex flex-col gap-2 p-4 text-sm">
      {content.map((contentGroup) => {
        return (
          <div key={contentGroup.title}>
            {contentGroup.href ? (
              <div>
                <Link
                  href={contentGroup.href ?? ""}
                  className={pathname === contentGroup.href ? "font-bold" : ""}
                >
                  {contentGroup.title}
                </Link>
              </div>
            ) : (
              <div>{contentGroup.title}</div>
            )}

            {contentGroup.sub && (
              <ul className="my-1">
                {contentGroup.sub.map((content) => {
                  return (
                    <li
                      key={content.title}
                      className={cn(
                        "border-l border-gray-200 pl-4 py-1.5",
                        pathname === content.href ? "font-bold" : ""
                      )}
                    >
                      <Link href={content.href ?? ""}>{content.title}</Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="hidden md:block fixed left-0 top-0 bottom-0 w-[300px] border-r overflow-y-auto">
        <div className="p-4 border-b">
          <div className="text-sm">
            Outerbase <strong>Studio</strong>
          </div>
          <div className="text-xl font-semibold">{title}</div>
        </div>
        {sideMenu}
      </div>
      <div className="md:hidden p-2 border-b flex">
        <div className="grow px-2 font-bold">{title}</div>
        <Sheet>
          <SheetTrigger>
            <div className="px-2">
              <LucideAlignJustify />
            </div>
          </SheetTrigger>
          <SheetContent className="px-0">{sideMenu}</SheetContent>
        </Sheet>
      </div>
    </>
  );
}
