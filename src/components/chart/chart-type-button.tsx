import { Button } from "../orbit/button";

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
    <Button
      variant={isActive ? "primary" : "secondary"}
      size="lg"
      shape="square"
      onClick={onClick}
      title={tooltipText}
    >
      {icon}
    </Button>
  );
}
