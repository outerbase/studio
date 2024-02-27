import dynamic from "next/dynamic";

const MainScreen = dynamic(() => import("../../components/main-connection"), {
  ssr: false,
});

export default function SessionPage() {
  return <MainScreen />;
}
