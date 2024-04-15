"use client";
import "./index.css";
import MainScreen from "./components/main-connection";
import { ConfigProvider } from "./contexts/config-provider";
import { DriverProvider } from "./contexts/driver-provider";
import ThemeProvider from "./contexts/theme-provider";
import type { BaseDriver } from "./drivers/base-driver";
import { CollaborationDriver } from "./drivers/collaboration-driver";

interface StudioProps {
  driver: BaseDriver;
  collaboration?: CollaborationDriver;
  name: string;
  color: string;
  defaultTheme?: "dark" | "light";
  onBack: () => void;
}

export function Studio({
  driver,
  defaultTheme,
  collaboration,
  name,
  color,
  onBack,
}: Readonly<StudioProps>) {
  return (
    <ThemeProvider defaultTheme={defaultTheme ?? "light"}>
      <DriverProvider driver={driver} collaborationDriver={collaboration}>
        <ConfigProvider name={name} color={color} onBack={onBack}>
          <MainScreen />
        </ConfigProvider>
      </DriverProvider>
    </ThemeProvider>
  );
}
