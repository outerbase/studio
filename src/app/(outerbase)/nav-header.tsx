import { cn } from "@/lib/utils";
import { Cardholder, Database, Gear } from "@phosphor-icons/react";

interface NavigationHeaderProps {
  title: string;
}

export default function NavigationHeader({ title }: NavigationHeaderProps) {
  const tabClassName =
    "p-2 border-b-2 border-background flex gap-2 items-center h-full";
  const selectedTabClassName = cn(tabClassName, "border-orange-500");

  return (
    <div className="bg-background flex h-12 flex-col gap-1 border-b px-6">
      <ul className="flex h-full gap-2 text-base">
        <li className={selectedTabClassName}>
          <Database />
          Resources
        </li>
        <li className={tabClassName}>
          <Gear />
          Settings
        </li>
        <li className={tabClassName}>
          <Cardholder />
          Billing
        </li>

        <li className="flex flex-1 items-center justify-end font-bold">
          {title}
        </li>
      </ul>
    </div>
  );
}
