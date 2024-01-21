import { Metadata } from "next";
import { ConnectionConfigScreen } from "./(components)/ConnectionConfigScreen";

export const metadata: Metadata = {
  title: "LibSQL Studio - Fast and powerful LibSQL client on your browser",
  description:
    "LibSQL Studio - Fast and powerful LibSQL client on your browser",
};

export default function Home() {
  return (
    <main className="flex flex-wrap w-screen h-screen justify-center content-center">
      <ConnectionConfigScreen />
    </main>
  );
}
