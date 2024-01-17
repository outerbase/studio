import dynamic from "next/dynamic";
import "@silevis/reactgrid/styles.css";

const MainScreen = dynamic(() => import("./(components)/MainScreen"), {
  ssr: false,
});

export default function Home() {
  return <MainScreen />;
}
