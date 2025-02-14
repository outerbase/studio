import { Button } from "../orbit/button";

interface ChartTypeButtonProps {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  tooltipText: string;
  suggested: boolean;
}

export function ChartTypeButton({
  tooltipText,
  onClick,
  isActive,
  icon,
  suggested,
}: ChartTypeButtonProps) {
  const className = suggested ? "border border-green-400 rounded-lg" : "";
  return (
    <div className={className}>
      <Button
        variant={isActive ? "primary" : "secondary"}
        size="lg"
        shape="square"
        onClick={onClick}
        title={tooltipText}
      >
        {icon}
      </Button>
    </div>
  );
}
