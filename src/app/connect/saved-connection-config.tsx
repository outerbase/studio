import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  CONNECTION_LABEL_COLORS,
  SavedConnectionItemConfig,
  SavedConnectionLabel,
  SupportedDriver,
} from "@/app/connect/saved-connection-storage";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { LucideLoader } from "lucide-react";

interface Props {
  onSave: (conn: SavedConnectionItemConfig) => void;
  driver: SupportedDriver;
  initialData?: SavedConnectionItemConfig;
  loading?: boolean;
  showLockedCredential?: boolean;
}

type AuthType = "token" | "username";

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
  driver,
  showLockedCredential,
  initialData,
  loading,
}: Readonly<Props>) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [color, setColor] = useState<SavedConnectionLabel>(
    initialData?.label ?? "gray"
  );
  const [url, setURL] = useState(initialData?.config?.url ?? "");
  const [token, setToken] = useState(initialData?.config?.token ?? "");
  const [username, setUsername] = useState(initialData?.config?.username ?? "");
  const [password, setPassword] = useState(initialData?.config?.password ?? "");

  const authType: AuthType = driver === "turso" ? "token" : "username";

  const onSaveClicked = () => {
    onSave({
      label: color,
      name,
      description,
      driver,
      config: { url, token, username, password },
    });
  };

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

      <div>
        <div className="text-xs mb-2">URL</div>
        <Input
          placeholder={"URL"}
          value={url}
          onChange={(e) => setURL(e.currentTarget.value)}
        />
      </div>

      {authType === "token" && (
        <div>
          <div className="text-xs mb-2">Token</div>
          <Textarea
            placeholder={showLockedCredential && !token ? "✱✱✱✱✱✱✱✱✱" : "Token"}
            value={token}
            className={showLockedCredential && !token ? "bg-secondary" : ""}
            onChange={(e) => setToken(e.currentTarget.value)}
          />
        </div>
      )}

      {authType === "username" && (
        <>
          <div>
            <div className="text-xs mb-2">Username</div>
            <Input
              type="username"
              placeholder={
                showLockedCredential && !username ? "✱✱✱✱✱✱✱✱✱" : "Username"
              }
              value={username}
              className={
                showLockedCredential && !username ? "bg-secondary" : ""
              }
              onChange={(e) => setUsername(e.currentTarget.value)}
            />
          </div>
          <div>
            <div className="text-xs mb-2">Password</div>
            <Input
              type="password"
              placeholder={
                showLockedCredential && !password ? "✱✱✱✱✱✱✱✱✱" : "Password"
              }
              value={password}
              className={
                showLockedCredential && !password ? "bg-secondary" : ""
              }
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
          </div>
        </>
      )}

      <div className="mt-12 flex gap-4">
        <Button onClick={onSaveClicked} disabled={loading}>
          {loading && <LucideLoader className="w-4 h-4 mr-2 animate-spin" />}
          Save
        </Button>
      </div>
    </>
  );
}
