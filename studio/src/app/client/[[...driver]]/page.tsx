import dynamic from "next/dynamic";

const ClientPageBody = dynamic(() => import("./page-client"), {
  ssr: false,
});

export default function SessionPage() {
  return <ClientPageBody />;
}
