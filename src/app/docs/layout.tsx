import { DocLayout } from "@/components/mdx/docs";

const TableContent = [
  {
    title: "LibSQL Studio",
  },
  {
    title: "Connecting",
    sub: [
      {
        title: "Connect to Turso",
        href: "/docs/connect-turso",
      },
      {
        title: "Connect to rqlite",
        href: "/learn/sqlite/introduction",
      },
      {
        title: "Connect to Valtown",
        href: "/learn/sqlite/introduction",
      },
    ],
  },
  {
    title: "Other",
    sub: [
      {
        title: "Self Hosting",
        href: "/learn/sqlite/indexing",
      },
      {
        title: "Temporary Session",
        href: "/docs/temporary-session",
      },
    ],
  },
];

export default function MdxLayout({ children }: { children: React.ReactNode }) {
  return (
    <DocLayout content={TableContent} title="Document">
      {children}
    </DocLayout>
  );
}
