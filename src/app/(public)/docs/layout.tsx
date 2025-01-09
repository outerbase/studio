import { DocLayout } from "@/components/mdx/docs";
import { WEBSITE_NAME } from "@/const";

const TableContent = [
  {
    title: WEBSITE_NAME,
    href: "/docs",
  },
  {
    title: "Connecting",
    sub: [
      {
        title: "Connect to Turso",
        href: "/docs/connect-turso",
      },
      {
        title: "Connect to Valtown",
        href: "/docs/connect-valtown",
      },
    ],
  },
  {
    title: "Integration",
    sub: [
      {
        title: "Embed Client",
        href: "/docs/embed-iframe-client",
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
