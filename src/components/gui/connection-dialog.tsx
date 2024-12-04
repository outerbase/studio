import { Button } from "@/components/ui/button";
import LogoLoading from "./logo-loading";
import { useConfig } from "@/context/config-provider";
import { useMemo } from "react";

export default function ConnectingDialog({
  message,
  onRetry,
}: Readonly<{
  loading?: boolean;
  message?: string;
  onRetry?: () => void;
}>) {
  const { name, onBack } = useConfig();

  const isElectron = useMemo(() => {
    return typeof window !== "undefined" && window.outerbaseIpc;
  }, []);

  const onElectronBack = () => {
    if (window.outerbaseIpc?.close) {
      window.outerbaseIpc?.close();
    }
  };

  const onElectronRetry = () => {
    window.location.reload();
  };

  let body = (
    <div>
      <p className="mt-4 flex gap-4">
        Connecting to <strong>{name}</strong>
      </p>
    </div>
  );

  if (message) {
    body = (
      <>
        <div className="text-2xl font-semibold">
          We have problem connecting to database
        </div>
        <pre className="mt-4">{message}</pre>
        <div className="mt-4 flex gap-4">
          <Button onClick={isElectron ? onElectronRetry : onRetry}>
            Retry
          </Button>
          <Button
            variant={"secondary"}
            onClick={isElectron ? onElectronBack : onBack}
          >
            Back
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="p-8">
      <LogoLoading />
      {body}
    </div>
  );
}
