"use client";
import "./index.css";
import MainScreen from "./components/main-connection";
import { ConfigProvider } from "./contexts/config-provider";
import { DriverProvider } from "./contexts/driver-provider";
import ThemeProvider from "./contexts/theme-provider";
import type { BaseDriver } from "./drivers/base-driver";
import { CollaborationDriver } from "./drivers/collaboration-driver";
import { ReactElement } from "react";

interface StudioProps {
  driver: BaseDriver;
  collaboration?: CollaborationDriver;
  name: string;
  color: string;
  defaultTheme?: "dark" | "light";
  onBack: () => void;

  sideBarFooterComponent?: ReactElement;
}

export function Studio({
  driver,
  defaultTheme,
  collaboration,
  name,
  color,
  sideBarFooterComponent,
  onBack,
}: Readonly<StudioProps>) {
  return (
    <ThemeProvider defaultTheme={defaultTheme ?? "light"}>
      <DriverProvider driver={driver} collaborationDriver={collaboration}>
        <ConfigProvider
          name={name}
          color={color}
          onBack={onBack}
          sideBarFooterComponent={sideBarFooterComponent}
        >
          <MainScreen />
        </ConfigProvider>
      </DriverProvider>
    </ThemeProvider>
  );
}
