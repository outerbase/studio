import ConnectingDialog from "@/screens/DatabaseScreen/ConnectingDialog";

export default function ConnectionErrorMessageStory() {
  return (
    <div className="flex flex-col gap-4">
      <ConnectingDialog message="Authentication failed: The JWT is invalid" />
      <ConnectingDialog loading url="wss://example.turso.io" />
    </div>
  );
}
