"use client";
import { Button } from "@/components/ui/button";
import { SavedConnectionStorage } from "@/app/connect/saved-connection-storage";
import { cn } from "@/lib/utils";
import { useState } from "react";

function SaveConnectionTypeItem({
  active,
  title,
  description,
  onClick,
}: Readonly<{
  active?: boolean;
  title: string;
  description: string;
  onClick: () => void;
}>) {
  const className = cn(
    "p-4 border max-w-[350px] border-2 rounded flex gap-4 cursor-pointer",
    active ? "border-black" : undefined
  );

  return (
    <div className={className} onClick={onClick}>
      <div>
        <h2 className="font-bold">{title}</h2>
        <p className="text-sm mt-2">{description}</p>
      </div>
    </div>
  );
}

export default function SaveConnectionType({
  onContinue,
}: Readonly<{ onContinue: (type: SavedConnectionStorage) => void }>) {
  const [type, setType] = useState<SavedConnectionStorage>("e2e");

  return (
    <div>
      <p className="mb-8">Where do you want to store your connection?</p>

      <div className="flex flex-col gap-4">
        <SaveConnectionTypeItem
          onClick={() => setType("e2e")}
          active={type === "e2e"}
          title="Remote with Encryption"
          description="Securely store your database credential on our server with end-to-end encryption using your master password."
        />
        <SaveConnectionTypeItem
          onClick={() => setType("local_storage")}
          active={type === "local_storage"}
          title="Local Storage"
          description="Store your database credential on your local storage."
        />
      </div>

      <Button className="mt-8" onClick={() => onContinue(type)}>
        Continue
      </Button>
    </div>
  );
}
