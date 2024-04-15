import { Button } from "@studio/components/ui/button";
import { Input } from "@studio/components/ui/input";
import { Separator } from "@studio/components/ui/separator";
import { Textarea } from "@studio/components/ui/textarea";
import {
  CONNECTION_LABEL_COLORS,
  DRIVER_DETAIL,
  SavedConnectionItemConfig,
  SavedConnectionItemConfigConfig,
  SavedConnectionLabel,
  SupportedDriver,
  prefillConnectionString,
  validateConnectionString,
} from "@studio/app/connect/saved-connection-storage";
import { cn } from "@studio/lib/utils";
import { useMemo, useState } from "react";
import { LucideLoader } from "lucide-react";
import ConnectionStringInput from "./connection-string-input";

interface Props {
  onSave: (conn: SavedConnectionItemConfig) => void;
  onClose: () => void;
  driver: SupportedDriver;
  initialData?: SavedConnectionItemConfig;
  loading?: boolean;
  showLockedCredential?: boolean;
}

function ColorItem({
  color,
  selected,
  onClick,
}: Readonly<{ color: string; selected: boolean; onClick: () => void }>) {
  const className = cn(
    color,
    selected ? "border-black" : "border-gray-300",
    "w-8 h-8 cursor-pointer rounded border-2"
  );

  return <div className={className} onClick={onClick}></div>;
}

export default function SavedConnectionConfig({
  onSave,
  onClose,
  driver,
  showLockedCredential,
  initialData,
  loading,
}: Readonly<Props>) {
  const driverDetail = DRIVER_DETAIL[driver ?? "turso"];
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [color, setColor] = useState<SavedConnectionLabel>(
    initialData?.label ?? "gray"
  );

  const [connectionString, setConnectionString] =
    useState<SavedConnectionItemConfigConfig>(() =>
      prefillConnectionString(driverDetail, initialData?.config)
    );

  const onSaveClicked = () => {
    onSave({
      label: color,
      name,
      description,
      driver,
      config: connectionString,
    });
  };

  const valid = useMemo(() => {
    return validateConnectionString(driverDetail, connectionString);
  }, [connectionString, driverDetail]);

  return (
    <>
      <div>
        <div className="text-xs mb-2">Name</div>
        <Input
          autoFocus
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
      </div>

      <div>
        <div className="text-xs mb-2">Description (Optional)</div>
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />
      </div>

      <div className="flex gap-2">
        {Object.entries(CONNECTION_LABEL_COLORS).map(
          ([labelColor, colorClassName]) => {
            return (
              <ColorItem
                onClick={() => setColor(labelColor as SavedConnectionLabel)}
                color={colorClassName}
                key={labelColor}
                selected={color === labelColor}
              />
            );
          }
        )}
      </div>

      <Separator />

      <ConnectionStringInput
        driver={driver}
        onChange={setConnectionString}
        value={connectionString}
        showLockedCredential={showLockedCredential}
      />

      <div className="mt-12 flex gap-2">
        <Button onClick={onSaveClicked} disabled={loading || !valid}>
          {loading && <LucideLoader className="w-4 h-4 mr-2 animate-spin" />}
          Save
        </Button>

        <Button onClick={onClose} variant={"secondary"}>
          Close
        </Button>
      </div>
    </>
  );
}
