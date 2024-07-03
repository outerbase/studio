import { cn } from "@/lib/utils";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { LucideAlignJustify } from "lucide-react";

interface DocTableContentGroup {
  title: string;
  href?: string;
  sub?: DocTableContentGroup[];
}

type DocTableContent = DocTableContentGroup[];

export function DocContent({
  children,
  title,
}: PropsWithChildren<{ title: string }>) {
  return (
    <>
      <div className="-mx-4 px-4 pb-4 border-b text-2xl font-semibold mb-4">
        <h1 className="max-w-[800px] mx-auto">{title}</h1>
      </div>
      <article className="max-w-[800px] mx-auto">{children}</article>
    </>
  );
}

function DocNavigation({ content }: { content: DocTableContent }) {
  const sideMenu = (
    <div className="flex flex-col gap-2 p-4 text-sm">
      {content.map((contentGroup) => {
        return (
          <div key={contentGroup.title}>
            <div>{contentGroup.title}</div>
            {contentGroup.sub && (
              <ul className="my-1">
                {contentGroup.sub.map((content) => {
                  return (
                    <li
                      key={content.title}
                      className={cn("border-l border-gray-200 pl-4 py-1.5")}
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
      <div className="hidden md:block fixed left-0 top-0 bottom-0 w-[300px] bg-white border-r overflow-y-auto">
        {sideMenu}
      </div>
      <div className="md:hidden p-2 border-b flex">
        <div className="flex-grow px-2">
          LibSQL<strong>Studio</strong>
        </div>
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

export function DocLayout({
  children,
  content,
}: PropsWithChildren<{ content: DocTableContent }>) {
  return (
    <>
      <DocNavigation content={content} />
      <div className="md:pl-[300px]">
        <article className="p-4">{children}</article>
      </div>
    </>
  );
}
