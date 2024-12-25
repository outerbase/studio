import { cn } from "@/lib/utils";

export default function ServerLoadingAnimation({
  className,
}: {
  className?: string;
}) {
  return (
    <div>
      <svg
        className={cn("w-32 h-32", className)}
        width="300"
        height="300"
        viewBox="40 40 220 220"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="300" height="300" fill="none" />
        <rect
          x="62"
          y="65"
          width="176"
          height="169"
          rx="20"
          className="fill-gray-300 dark:fill-gray-500"
        />
        <rect
          x="49.5"
          y="82.5"
          width="201"
          height="58"
          rx="4.5"
          className="stroke-gray-400 fill-white stroke-2 dark:stroke-gray-400 dark:fill-black"
        />
        <rect
          x="230"
          y="92"
          width="8"
          height="41"
          rx="4"
          fill="#D9D9D9"
          className="fill-gray-500"
        />
        <rect
          x="217"
          y="92"
          width="8"
          height="41"
          rx="4"
          className="fill-gray-500"
        />
        <rect
          x="204"
          y="92"
          width="8"
          height="41"
          rx="4"
          className="fill-gray-500"
        />
        <rect
          x="62"
          y="92"
          width="60"
          height="8"
          rx="4"
          className="fill-gray-500 animate-pulse duration-200"
        />
        <rect
          x="127"
          y="92"
          width="21"
          height="8"
          rx="4"
          className="fill-gray-500"
        />
        <rect
          x="62"
          y="107"
          width="30"
          height="8"
          rx="4"
          className="fill-gray-500"
        />
        <rect
          x="96"
          y="107"
          width="46"
          height="8"
          rx="4"
          className="fill-gray-500 animate-pulse duration-200"
        />
        <rect
          x="62"
          y="122"
          width="57"
          height="8"
          rx="4"
          className="fill-gray-500 animate-pulse duration-200"
        />

        <rect
          x="49.5"
          y="158.5"
          width="201"
          height="58"
          rx="4.5"
          className="stroke-gray-400 fill-white stroke-2 dark:stroke-gray-400 dark:fill-black"
        />

        <rect
          x="230"
          y="168"
          width="8"
          height="41"
          rx="4"
          className="fill-gray-500"
        />
        <rect
          x="217"
          y="168"
          width="8"
          height="41"
          rx="4"
          className="fill-gray-500"
        />
        <rect
          x="204"
          y="168"
          width="8"
          height="41"
          rx="4"
          className="fill-gray-500"
        />
        <rect
          x="62"
          y="168"
          width="60"
          height="8"
          rx="4"
          className="fill-gray-500"
        />
        <rect
          x="127"
          y="168"
          width="21"
          height="8"
          rx="4"
          className="fill-gray-500 animate-pulse duration-200"
        />
        <rect
          x="62"
          y="183"
          width="30"
          height="8"
          rx="4"
          className="fill-gray-500 animate-pulse duration-200"
        />
        <rect
          x="96"
          y="183"
          width="46"
          height="8"
          rx="4"
          className="fill-gray-500"
        />
        <rect
          x="62"
          y="198"
          width="57"
          height="8"
          rx="4"
          className="fill-gray-500"
        />
      </svg>
    </div>
  );
}
