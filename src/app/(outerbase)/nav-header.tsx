import NewResourceButton from "./new-resource-button";

interface NavigationHeaderProps {
  title: string;
}

export default function NavigationHeader({ title }: NavigationHeaderProps) {
  return (
    <div className="bg-background flex h-12 items-center border-b px-4">
      <div className="flex-1 text-base">{title}</div>
      <div>
        <NewResourceButton />
      </div>
    </div>
  );
}
