import { LucideX } from "lucide-react";
import { PropsWithChildren } from "react";
import { DRIVER_DETAIL, SupportedDriver } from "./saved-connection-storage";

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
  return (
    <div className="flex flex-col gap-4 p-8">
      <div className="flex items-center mb-4">
        <img
          src={DRIVER_DETAIL[driver ?? "turso"].icon}
          alt=""
          className="w-8 h-8 rounded mr-2"
        />
        <h2 className="text-xl font-semibold grow">{title}</h2>
        <button
          className="bg-secondary w-8 h-8 flex justify-center items-center rounded-full"
          onClick={onClose}
        >
          <LucideX className="w-5 h-5" />
        </button>
      </div>

      {children}
    </div>
  );
}
