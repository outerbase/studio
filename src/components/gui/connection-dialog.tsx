import { Button } from "@/components/ui/button";
import { useStudioContext } from "@/context/driver-provider";
import { useMemo } from "react";
import ServerLoadingAnimation from "../icons/server-loading";

export default function ConnectingDialog({
  message,
  onRetry,
}: Readonly<{
  loading?: boolean;
  message?: string;
  onRetry?: () => void;
}>) {
  const { name, onBack } = useStudioContext();

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
    <p>
      Connecting to <strong>{name}</strong>
    </p>
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
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      <ServerLoadingAnimation />
      {body}
    </div>
  );
}
