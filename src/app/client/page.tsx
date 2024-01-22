import dynamic from "next/dynamic";

const MainScreen = dynamic(() => import("../(components)/MainScreen"), {
  ssr: false,
});

export default function SessionPage() {
  return <MainScreen />;
}
