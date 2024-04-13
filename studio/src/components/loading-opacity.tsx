import { LucideLoader2 } from "lucide-react";

export default function OpacityLoading() {
  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 z-10">
      <div className="absolute left-0 right-0 top-0 bottom-0 opacity-50 bg-gray-600" />
      <div className="absolute left-0 right-0 top-0 bottom-0 flex justify-center items-center">
        <div className="p-5 bg-white rounded-lg justify-center items-center flex flex-col">
          <LucideLoader2 className="animate-spin text-2xl mb-2" />
          <div className="text-sm">Loading</div>
        </div>
      </div>
    </div>
  );
}
