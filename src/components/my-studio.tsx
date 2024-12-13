import { useRouter } from "next/navigation";
import { ReactElement, useCallback } from "react";
import { BaseDriver } from "@/drivers/base-driver";
import { CollaborationBaseDriver } from "@/drivers/collaboration-driver-base";
import { Studio } from "./gui/studio";
import { SavedDocDriver } from "@/drivers/saved-doc/saved-doc-driver";

interface MyStudioProps {
  name: string;
  color: string;
  driver: BaseDriver;
  expiredAt?: number;
  collabarator?: CollaborationBaseDriver;
  docDriver?: SavedDocDriver;
  sideBarFooterComponent?: ReactElement;
}

function MyStudioInternal({
  name,
  color,
  driver,
  docDriver,
  collabarator,
  sideBarFooterComponent,
}: MyStudioProps) {
  const router = useRouter();

  const goBack = useCallback(() => {
    router.push("/connect");
  }, [router]);

  return (
    <Studio
      driver={driver}
      name={name}
      color={color ?? "blue"}
      onBack={goBack}
      collaboration={collabarator}
      docDriver={docDriver}
      sideBarFooterComponent={sideBarFooterComponent}
    />
  );
}

export default function MyStudio(props: MyStudioProps) {
  return <MyStudioInternal {...props} />;
}
