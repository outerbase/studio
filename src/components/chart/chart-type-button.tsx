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
      onClick={onClick}
      title={tooltipText}
      style={{
        width: "50px",
        height: "50px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isActive
          ? "var(--chart-button-selected)"
          : "var(--chart-button-bg)",
        color: isActive
          ? "var(--chart-button-bg)"
          : "var(--chart-button-selected)",
        border: "none",
        cursor: "pointer",
        transition: "background-color 0.3s",
      }}
    >
      {icon}
    </button>
  );
}
