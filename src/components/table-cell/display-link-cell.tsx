import Link from "next/link";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

const IMAGE_EXTENSION = ["jpg", "jpeg", "png", "pneg", "svg", "bmp", "gif"];

export default function DisplayLinkCell({ link }: { link: string }) {
  const extension = link.split(".").pop();
  console.log("ex", extension);

  if (IMAGE_EXTENSION.includes((extension ?? "").toLowerCase())) {
    return (
      <div className="flex">
        <HoverCard>
          <HoverCardTrigger
            href={link}
            target="_blank"
            className="text-blue-600 dark:text-blue-300 underline"
          >
            {link}
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="p-2 bg-gray-600 dark:bg-gray-800 rounded">
              <img
                src={link}
                alt=""
                className="object-contain w-[200px] h-[200px]"
              />
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    );
  }

  return (
    <div className="flex">
      <Link
        target="_blank"
        href={link}
        className="text-blue-600 dark:text-blue-300 underline"
      >
        {link}
      </Link>
    </div>
  );
}
