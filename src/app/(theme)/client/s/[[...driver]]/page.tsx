import ClientOnly from "@/components/client-only";
import ClientPageBody from "./page-client";

export default function SessionPage() {
  return (
    <ClientOnly>
      <ClientPageBody />
    </ClientOnly>
  );
}
