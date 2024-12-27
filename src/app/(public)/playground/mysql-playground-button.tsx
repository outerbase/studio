"use client";
import { MySQLIcon } from "@/components/icons/outerbase-icon";
import { useRouter } from "next/navigation";

export default function MySQLPlaygroundButton() {
  const router = useRouter();

  return (
    <button
      className={
        "text-left bg-primary text-primary-foreground p-3 px-4 rounded-lg text-sm gap-2 flex flex-col hover:bg-gray-300 w-[200px]"
      }
      onClick={() => {
        // Random 8 character alphabeth string
        const roomName = new Array(8)
          .fill("a")
          .map(
            () => "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]
          )
          .join("");

        router.push(`/playground/mysql/${roomName}`);
      }}
    >
      <div className="flex gap-2">
        <MySQLIcon className="w-10 h-10" />
        <div className="flex flex-col justify-center">
          <div className="font-bold text-md">MySQL</div>
          <div className="text-xs">Playground</div>
        </div>
      </div>

      <p className="text-xs text-gray-500">Spin up a cloud MySQL sandbox.</p>
    </button>
  );
}
