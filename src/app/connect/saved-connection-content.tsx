import { LucideX } from "lucide-react";
import { PropsWithChildren } from "react";

export default function ConnectionDialogContent({
  children,
  title,
  onClose,
}: Readonly<PropsWithChildren<{ title: string; onClose: () => void }>>) {
  return (
    <div className="flex flex-col gap-4 p-8">
      <div className="flex">
        <h2 className="text-xl font-semibold mb-4 grow">{title}</h2>
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
