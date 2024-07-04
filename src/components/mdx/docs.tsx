import { cn } from "@/lib/utils";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { LucideAlignJustify } from "lucide-react";
import { usePathname } from "next/navigation";
import { DocNavigation } from "./docs-navigation";

interface DocTableContentGroup {
  title: string;
  href?: string;
  sub?: DocTableContentGroup[];
}

export type DocTableContent = DocTableContentGroup[];

export function DocContent({
  children,
  title,
  group,
}: PropsWithChildren<{ title: string; group?: string }>) {
  return (
    <>
      <div className="-mx-4 px-4 pb-4 border-b mb-4">
        <div className="max-w-[800px] mx-auto">
          {group && <span className="text-sm">{group}</span>}
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
      </div>
      <article className="max-w-[800px] mx-auto">{children}</article>
    </>
  );
}

export function DocLayout({
  children,
  content,
  title,
}: PropsWithChildren<{ content: DocTableContent; title?: string }>) {
  return (
    <>
      <DocNavigation content={content} title={title} />
      <div className="md:pl-[300px]">
        <article className="p-4 mdx-content">{children}</article>
      </div>
    </>
  );
}
