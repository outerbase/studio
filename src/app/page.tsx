import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "LibSQL Studio - Fast and powerful LibSQL client on your browser",
  description:
    "LibSQL Studio - Fast and powerful LibSQL client on your browser",
};

const ConnectionConfigScreen = dynamic(
  () => import("../components/connection-config-list"),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <main className="flex flex-wrap w-screen h-screen justify-center content-center">
      <ConnectionConfigScreen />
    </main>
  );
}
