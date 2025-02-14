import { Button } from "@/components/orbit/button";
import { Input } from "@/components/orbit/input";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function TwoFactorAuth() {
  const [add, setAdd] = useState(false);
  // not implement two factor authentication yet

  let footer = (
    <Button
      onClick={() => setAdd(true)}
      title="Add 2FA Device"
      size="lg"
      className="mt-10"
    />
  );

  if (add) {
    footer = (
      <div className="mt-10 flex flex-col gap-5">
        <div className="flex flex-row items-center gap-5">
          <Button
            onClick={() => setAdd(true)}
            title="SMS"
            size="lg"
            className="w-[170px] justify-center"
          />
          <Button
            onClick={() => setAdd(true)}
            title="Authentication App"
            size="lg"
            className="w-[170px] justify-center"
          />
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <Label className="font-semibold">
            Country or region code <span className="text-red-500">*</span>
          </Label>
          <Button variant="secondary" className="w-[250px]">
            <span className="font-normal">(+1) United State</span>
            <div className="flex-1" />
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="font-semibold">
            Your phone number <span className="text-red-500">*</span>
          </Label>
          <Input className="w-[250px]" />
        </div>
        <div className="flex flex-row gap-5">
          <Button variant="primary" title="Sent Code" className="rounded-4xl" />

          <Button
            title="Cancel"
            onClick={() => setAdd(false)}
            className="bg-gray-600"
          />
        </div>
      </div>
    );
  }
  return (
    <div className="mt-6 flex flex-col items-start gap-2">
      <h2 className="text-xl font-medium text-balance text-neutral-800 dark:text-neutral-100">
        Two-factor authentication
      </h2>
      <span className="text-accent-foreground text-base dark:text-neutral-400">
        Requiring more than just a password to sign in to your account, giving
        your Outerbase account an additional layer of security.
      </span>
      {footer}
    </div>
  );
}
