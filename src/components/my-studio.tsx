import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { BaseDriver } from "@/drivers/base-driver";
import { CollaborationBaseDriver } from "@/drivers/collaboration-driver-base";
import { Studio } from "./gui/studio";
import { SavedDocDriver } from "@/drivers/saved-doc/saved-doc-driver";
import { StudioExtensionManager } from "@/core/extension-manager";
import { createStandardExtensions } from "@/core/standard-extension";

interface MyStudioProps {
  name: string;
  color: string;
  driver: BaseDriver;
  expiredAt?: number;
  collabarator?: CollaborationBaseDriver;
  docDriver?: SavedDocDriver;
}

function MyStudioInternal({
  name,
  color,
  driver,
  docDriver,
  collabarator,
}: MyStudioProps) {
  const router = useRouter();

  const goBack = useCallback(() => {
    router.push("/connect");
  }, [router]);

  const extensions = useMemo(() => {
    console.log("Create standard extensions");
    return new StudioExtensionManager(createStandardExtensions());
  }, []);

  return (
    <Studio
      extensions={extensions}
      driver={driver}
      name={name}
      color={color ?? "blue"}
      onBack={goBack}
      collaboration={collabarator}
      docDriver={docDriver}
    />
  );
}

export default function MyStudio(props: MyStudioProps) {
  return <MyStudioInternal {...props} />;
}
