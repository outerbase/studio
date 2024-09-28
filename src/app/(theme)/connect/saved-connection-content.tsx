import { PropsWithChildren } from "react";
import { DRIVER_DETAIL, SupportedDriver } from "./saved-connection-storage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ConnectionDialogContent({
  children,
  title,
  driver,
  onClose,
}: Readonly<
  PropsWithChildren<{
    title: string;
    onClose: () => void;
    driver: SupportedDriver;
  }>
>) {
  const DatabaseIcon = DRIVER_DETAIL[driver ?? "turso"].icon;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) return onClose();
      }}
    >
      <DialogContent className="lg:min-w-[600px] xl:min-w-[600px]">
        <DialogTitle>
          <div className="flex gap-2 items-center h-8">
            <DatabaseIcon className="w-8 h-8" />
            <div className="flex flex-1 items-center">{title}</div>
          </div>
        </DialogTitle>
        <DialogDescription />
        <div className="flex flex-col gap-4 text-foreground">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
