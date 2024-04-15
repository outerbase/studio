"use client";
import ConnectingDialog from "@studio/components/connection-dialog";

export default function ConnectionErrorMessageStory() {
  return (
    <div className="flex flex-col gap-4">
      <ConnectingDialog message="Authentication failed: The JWT is invalid" />
      <ConnectingDialog loading />
    </div>
  );
}
