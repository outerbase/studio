import { cn } from "@/lib/utils";

interface ChartTypeButtonProps {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  tooltipText: string;
}

export function ChartTypeButton({
  tooltipText,
  onClick,
  isActive,
  icon,
}: ChartTypeButtonProps) {
  return (
    <button
      className={cn(
        "flex size-[50px] cursor-pointer items-center justify-center rounded-lg border-0 transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground"
      )}
      onClick={onClick}
      title={tooltipText}
    >
      {icon}
    </button>
  );
}
