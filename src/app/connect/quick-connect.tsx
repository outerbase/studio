import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ConnectionDialogContent from "./saved-connection-content";
import { useCallback, useState } from "react";
import useConnect from "@/hooks/use-connect";

export default function QuickConnect({
  onClose,
}: Readonly<{ onClose: () => void }>) {
  const [url, setURL] = useState("");
  const [token, setToken] = useState("");
  const connect = useConnect();

  const onConnect = useCallback(() => {
    connect(url, token);
  }, [connect, url, token]);

  return (
    <ConnectionDialogContent title="Quick Connect" onClose={onClose}>
      <div>
        <div className="text-xs mb-2">URL</div>
        <Input
          placeholder={"URL"}
          value={url}
          onChange={(e) => setURL(e.currentTarget.value)}
        />
      </div>

      <div>
        <div className="text-xs mb-2">Token</div>
        <Textarea
          placeholder={"Token"}
          value={token}
          onChange={(e) => setToken(e.currentTarget.value)}
        />
      </div>

      <div className="mt-12 flex gap-4">
        <Button onClick={onConnect}>Connect</Button>
      </div>
    </ConnectionDialogContent>
  );
}
