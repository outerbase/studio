import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ConnectionDialogContent from "./saved-connection-content";
import { useCallback, useState } from "react";
import useConnect from "@/hooks/use-connect";
import { SupportedDriver } from "./saved-connection-storage";

export default function QuickConnect({
  driver,
  onClose,
}: Readonly<{ onClose: () => void; driver: SupportedDriver }>) {
  const [url, setURL] = useState("");
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const connect = useConnect();

  const onConnect = useCallback(() => {
    connect(driver, {
      token,
      url,
      password,
      username,
    });
  }, [connect, driver, url, token, password, username]);

  const authType = driver === "turso" ? "token" : "username";

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

      {authType === "token" && (
        <div>
          <div className="text-xs mb-2">Token</div>
          <Textarea
            placeholder={"Token"}
            value={token}
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
              placeholder={"Username"}
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
            />
          </div>
          <div>
            <div className="text-xs mb-2">Password</div>
            <Input
              type="password"
              placeholder={"Password"}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
          </div>
        </>
      )}

      <div className="mt-12 flex gap-4">
        <Button onClick={onConnect}>Connect</Button>
      </div>
    </ConnectionDialogContent>
  );
}
