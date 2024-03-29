import { Button } from "@/components/ui/button";
import ConnectionDialogContent from "./saved-connection-content";
import { useCallback, useState } from "react";
import useConnect from "@/hooks/use-connect";
import {
  DRIVER_DETAIL,
  SavedConnectionItemConfigConfig,
  SupportedDriver,
} from "./saved-connection-storage";
import { RqliteInstruction } from "./saved-connection";
import ConnectionStringInput from "./connection-string-input";

export default function QuickConnect({
  driver,
  onClose,
}: Readonly<{ onClose: () => void; driver: SupportedDriver }>) {
  const driverDetail = DRIVER_DETAIL[driver ?? "turso"];
  const [connectionConfig, setConnectionConfig] =
    useState<SavedConnectionItemConfigConfig>({
      url: DRIVER_DETAIL[driver ?? "turso"].prefill,
      token: "",
      username: "",
      password: "",
    });

  const connect = useConnect();
  const valid = !driverDetail.invalidateEndpoint(connectionConfig.url);

  const onConnect = useCallback(() => {
    connect(driver, {
      token: connectionConfig.token,
      url: connectionConfig.url,
      password: connectionConfig.password,
      username: connectionConfig.username,
    });
  }, [connect, driver, connectionConfig]);

  return (
    <ConnectionDialogContent
      driver={driver}
      title="Quick Connect"
      onClose={onClose}
    >
      {driver === "rqlite" && <RqliteInstruction />}

      <ConnectionStringInput
        autoFocus
        driver={driver}
        onChange={setConnectionConfig}
        value={connectionConfig}
      />

      <div className="mt-12 flex gap-4">
        <Button onClick={onConnect} disabled={!valid}>
          Connect
        </Button>
      </div>
    </ConnectionDialogContent>
  );
}
