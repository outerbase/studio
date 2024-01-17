import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ConnectionConfigScreen({
  onConnect,
}: {
  onConnect: (credential: { url: string; token: string }) => void;
}) {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");

  const onConnectClicked = () => {
    if (url && token) {
      onConnect({ url, token });
    }
  };

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>Connect to LibSQL</CardTitle>
        <CardDescription>
          Connect to your LibSQL securely. This client is entirely run in
          client-side. It does not store your credential.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="url">Link</Label>
              <Input
                id="url"
                placeholder="Endpoint"
                value={url}
                onChange={(e) => setUrl(e.currentTarget.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="token">Token</Label>
              <Input
                type="password"
                id="token"
                placeholder="Token"
                value={token}
                onChange={(e) => setToken(e.currentTarget.value)}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={onConnectClicked}>Connect</Button>
      </CardFooter>
    </Card>
  );
}
