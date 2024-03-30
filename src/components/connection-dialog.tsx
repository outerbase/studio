import { Button } from "@/components/ui/button";
import { useConnectionConfig } from "@/context/connection-config-provider";
import { useRouter } from "next/navigation";
import LogoLoading from "./logo-loading";

export default function ConnectingDialog({
  message,
  onRetry,
}: Readonly<{
  loading?: boolean;
  message?: string;
  onRetry?: () => void;
}>) {
  const { config } = useConnectionConfig();

  const router = useRouter();

  let body = (
    <div>
      <p className="mt-4 flex gap-4">
        Connecting to <strong>{config.name}</strong>
      </p>
    </div>
  );

  if (message) {
    body = (
      <>
        <div className="text-2xl font-semibold">
          We have problem connecting to database
        </div>
        <p className="mt-4">
          <pre>{message}</pre>
        </p>
        <div className="mt-4 flex gap-4">
          <Button onClick={onRetry}>Retry</Button>
          <Button variant={"secondary"} onClick={() => router.push("/connect")}>
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
