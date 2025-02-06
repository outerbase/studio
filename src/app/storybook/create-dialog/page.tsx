"use client";
import { createDialog } from "@/components/create-dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

const testingDialog = createDialog<unknown, string>(() => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Hello World</DialogTitle>
        <DialogDescription>This is a test dialog</DialogDescription>
      </DialogHeader>
    </>
  );
}, "close");

export default function StorybookCreateDialogPage() {
  return (
    <div>
      <h1>StorybookCreateDialogPage</h1>
      <Button
        onClick={() => {
          testingDialog.show({}).then(console.log);
        }}
      >
        Show Dialog
      </Button>
    </div>
  );
}
