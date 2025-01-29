import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";
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
}: PropsWithChildren<{ title?: string; group?: string }>) {
  return (
    <>
      {title && (
        <div className="-mx-4 mb-4 border-b px-4 pb-4">
          <div className="max-w-[800px]">
            {group && <span className="text-sm">{group}</span>}
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
        </div>
      )}
      <article className={cn("mdx-content max-w-[800px]", { "mt-4": !title })}>
        {children}
      </article>
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
        <article className="mdx-content p-4">{children}</article>
      </div>
    </>
  );
}
