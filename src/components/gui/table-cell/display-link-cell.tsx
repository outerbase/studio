import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../ui/hover-card";
import { Button } from "../../ui/button";

const IMAGE_EXTENSION = ["jpg", "jpeg", "png", "pneg", "svg", "bmp", "gif"];

export default function DisplayLinkCell({ link }: { link: string }) {
  const extension = link.split(".").pop();
  const isImage = IMAGE_EXTENSION.includes((extension ?? "").toLowerCase());

  return (
    <div className="flex w-full">
      <HoverCard>
        <HoverCardTrigger
          target="_blank"
          className="text-blue-600 dark:text-blue-300 underline flex-1 text-ellipsis overflow-hidden whitespace-nowrap"
        >
          {link}
        </HoverCardTrigger>
        <HoverCardContent side="bottom" align="start" className="min-w-[300px]">
          <div className="flex flex-col gap-2">
            {isImage && (
              <div className="p-2 bg-gray-600 dark:bg-gray-800 rounded justify-center items-center flex">
                <img
                  src={link}
                  alt=""
                  className="object-contain w-[200px] h-[200px]"
                />
              </div>
            )}

            <div className="font-mono text-sm line-clamp-3 truncate break-all w-[250px] whitespace-normal">
              {link}
            </div>

            <div>
              <a
                target="_blank"
                className="inline-block"
                href={link}
                rel="noreferrer"
              >
                <Button>Open Link</Button>
              </a>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
