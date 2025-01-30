"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getOuterbaseWorkspace,
  loginOuterbaseByPassword,
} from "@/outerbase-cloud/api";
import { OuterbaseAPIError } from "@/outerbase-cloud/api-type";
import { LucideLoader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onLoginClicked = useCallback(() => {
    setLoading(true);

    loginOuterbaseByPassword(email, password)
      .then((session) => {
        localStorage.setItem("session", JSON.stringify(session));
        localStorage.setItem("ob-token", session.token);

        getOuterbaseWorkspace()
          .then((w) => {
            router.push(`/w/${w.items[0].short_name}`);
          })
          .catch(console.error)
          .finally(() => {
            setLoading(false);
          });
      })
      .catch((e) => {
        setLoading(false);
        if (e instanceof OuterbaseAPIError) {
          setError(e.description);
        }
      });
  }, [email, password, router]);

  return (
    <body>
      <div className="mx-auto flex w-[300px] flex-col gap-4 p-4">
        <Input
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <Input
          value={password}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.currentTarget.value)}
        />

        {error && <div>{error}</div>}

        <Button onClick={onLoginClicked}>
          {loading && <LucideLoader className="mr-1 h-4 w-4 animate-spin" />}
          Login
        </Button>
      </div>
    </body>
  );
}
