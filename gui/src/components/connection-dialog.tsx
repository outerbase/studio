import { Button } from "@/components/ui/button";
import LogoLoading from "./logo-loading";
import { useConfig } from "@/contexts/config-provider";

export default function ConnectingDialog({
  message,
  onRetry,
}: Readonly<{
  loading?: boolean;
  message?: string;
  onRetry?: () => void;
}>) {
  const { name, onBack } = useConfig();
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
        <p className="mt-4">
          <pre>{message}</pre>
        </p>
        <div className="mt-4 flex gap-4">
          <Button onClick={onRetry}>Retry</Button>
          <Button variant={"secondary"} onClick={onBack}>
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
