import { Button } from "@/components/ui/button";
import { LucideLoader } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConnectingDialog({
  message,
  url,
  onRetry,
}: Readonly<{
  loading?: boolean;
  url?: string;
  message?: string;
  onRetry?: () => void;
}>) {
  const router = useRouter();

  let body = (
    <div>
      <p className="mt-4 flex gap-4">
        <LucideLoader className="animate-spin" />
        Connecting to <strong>{url}</strong>
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
          <Button variant={"secondary"} onClick={() => router.push("/")}>
            Back
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="p-8">
      <div
        className="mb-4 flex gap-2 items-center pl-8 pt-4 pb-4 rounded-lg select-none text-white"
        style={{ background: "#2C5FC3", maxWidth: 300 }}
      >
        <img src="/libsql-logo.png" alt="LibSQL Studio" className="w-12 h-12" />
        <div>
          <h1 className="text-2xl font-semibold">LibSQL Studio</h1>
        </div>
      </div>

      {body}
    </div>
  );
}
