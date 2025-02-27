"use client";
import { createDialog } from "@/components/create-dialog";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useState } from "react";

const testingDialog = createDialog<{ color: string }, string>(
  ({ close, color }) => {
    const [name, setName] = useState("");

    return (
      <>
        <DialogHeader>
          <DialogTitle className={color}>Hello World</DialogTitle>
          <DialogDescription>Please enter your name</DialogDescription>
        </DialogHeader>

        <div>
          <Input
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              close(name);
            }}
          >
            Done
          </Button>
        </DialogFooter>
      </>
    );
  },
  { defaultValue: "close" }
);

export function StorybookCreateDialogExample() {
  const [name, setName] = useState("");

  return (
    <div className="bg-secondary border p-4">
      <Button
        onClick={async () => {
          const result = await testingDialog.show({ color: "text-red-500" });
          setName(result);
        }}
      >
        Show Dialog
      </Button>

      <div className="mt-1">{name && <strong>Name: {name}</strong>}</div>
    </div>
  );
}
