import { useTheme } from "next-themes";
import Image from "next/image";
import { useMemo } from "react";

export default function EmptyTermDefinition() {
  const { resolvedTheme } = useTheme();
  const EmptyTerm = useMemo(() => {
    return [
      {
        src: `/extension/term-${resolvedTheme}.png`,
        title: "Create a term",
        describtion:
          "Start by adding a term or acronym your organization regularly uses.",
      },
      {
        src: `/extension/definition-${resolvedTheme}.png`,
        title: "Add a definition",
        describtion:
          "Give your term context and define it using plaintext or SQL.",
      },
      {
        src: `/extension/chart-${resolvedTheme}.png`,
        title: "Reference your entry",
        describtion:
          "Now, your entry can be referenced while chatting with EZQL.",
      },
    ];
  }, [resolvedTheme]);

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
      {EmptyTerm.map((item, index) => {
        return (
          <div key={index}>
            <div className="bg-accent relative mt-10 mb-10 h-[280px] flex-1 items-center justify-center rounded-md border pb-0 dark:bg-neutral-900">
              <div className="relative h-full w-full overflow-hidden rounded-md">
                <Image
                  src={item.src}
                  alt={item.title}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div>
            <div className="flex gap-2 text-xl font-semibold">
              <div className="bg-accent h-[32px] w-[32px] rounded text-center dark:bg-neutral-900">
                {index + 1}
              </div>
              {item.title}
            </div>
            <div className="mt-1 ml-10 text-base font-normal">
              {item.describtion}
            </div>
          </div>
        );
      })}
    </div>
  );
}
