import type React from "react";

interface CircularProgressBarProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  progressColor?: string;
}

export const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 12,
  backgroundColor = "var(--bg-secondary)",
  progressColor = "#3b82f6",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (value / max) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="-rotate-90 transform" width={size} height={size}>
        <circle
          className="text-secondary"
          strokeWidth={strokeWidth}
          stroke={backgroundColor}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-blue-600 transition-all"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke={progressColor}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
    </div>
  );
};
