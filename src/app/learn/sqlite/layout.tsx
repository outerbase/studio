import { DocLayout } from "@/components/mdx/docs";

const TableContent = [
  {
    title: "Introduction",
    sub: [
      {
        title: "Introduction to this course",
        href: "/learn/sqlite/introduction",
      },
    ],
  },
  {
    title: "Indexing",
    sub: [
      {
        title: "Indexing",
        href: "/learn/sqlite/indexing",
      },
      {
        title: "Index Hinting",
        href: "/learn/sqlite/indexing",
      },
      {
        title: "Composite Index",
        href: "/learn/sqlite/indexing",
      },
    ],
  },
];

export default function MdxLayout({ children }: { children: React.ReactNode }) {
  return <DocLayout content={TableContent}>{children}</DocLayout>;
}
