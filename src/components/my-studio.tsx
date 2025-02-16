import { StudioExtensionManager } from "@/core/extension-manager";
import {
  createMySQLExtensions,
  createPostgreSQLExtensions,
  createSQLiteExtensions,
  createStandardExtensions,
} from "@/core/standard-extension";
import { BaseDriver } from "@/drivers/base-driver";
import { CollaborationBaseDriver } from "@/drivers/collaboration-driver-base";
import { SavedDocDriver } from "@/drivers/saved-doc/saved-doc-driver";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Studio } from "./gui/studio";

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
  const dialet = driver.getFlags().dialect;

  const goBack = useCallback(() => {
    router.push("/connect");
  }, [router]);

  const extensions = useMemo(() => {
    if (dialet === "mysql") {
      return new StudioExtensionManager(createMySQLExtensions());
    } else if (dialet === "sqlite") {
      return new StudioExtensionManager(createSQLiteExtensions());
    } else if (dialet === "postgres") {
      return new StudioExtensionManager(createPostgreSQLExtensions());
    }

    return new StudioExtensionManager(createStandardExtensions());
  }, [dialet]);

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
