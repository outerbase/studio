import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  CONNECTION_LABEL_COLORS,
  SavedConnectionItemConfig,
  SavedConnectionLabel,
} from "@/app/connect/saved-connection-storage";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

export default function ConnectionDialog({
  onSave,
}: Readonly<{ onSave: (conn: SavedConnectionItemConfig) => void }>) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<SavedConnectionLabel>("gray");
  const [url, setURL] = useState("");
  const [token, setToken] = useState("");

  const onSaveClicked = () => {
    onSave({ label: color, name, description, config: { url, token } });
  };

  return (
    <>
      <div>
        <div className="text-xs mb-2">Name</div>
        <Input
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

      <div>
        <div className="text-xs mb-2">URL</div>
        <Input
          placeholder="Name"
          value={url}
          onChange={(e) => setURL(e.currentTarget.value)}
        />
      </div>

      <div>
        <div className="text-xs mb-2">Token</div>
        <Textarea
          placeholder="Token"
          value={token}
          onChange={(e) => setToken(e.currentTarget.value)}
        />
      </div>

      <div className="mt-12 flex gap-4">
        <Button onClick={onSaveClicked}>Save</Button>
      </div>
    </>
  );
}
