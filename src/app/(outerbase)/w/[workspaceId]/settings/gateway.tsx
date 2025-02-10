import { Button } from "@/components/orbit/button";

export default function WorkspaceGatewaySection() {
  return (
    <div className="mt-12 flex flex-col gap-4">
      <h2 className="font-bold">Gateway</h2>

      <p className="text-base">
        Securely access private network databases without modifying your
        firewall or VPN
      </p>

      <div>
        <Button size="lg" variant="secondary">
          New Gateway
        </Button>
      </div>
    </div>
  );
}
