import MainScreen from "./components/main-connection";
import { ConfigProvider } from "./contexts/config-provider";
import { DriverProvider } from "./contexts/driver-provider";
import ThemeProvider from "./contexts/theme-provider";
import type { BaseDriver } from "./drivers/base-driver";

interface StudioProps {
  driver: BaseDriver;
  name: string;
  color: string;
  onBack: () => void;
}

export function Studio({ driver, name, color, onBack }: Readonly<StudioProps>) {
  return (
    <ThemeProvider defaultTheme={"dark"}>
      <DriverProvider driver={driver}>
        <ConfigProvider name={name} color={color} onBack={onBack}>
          <MainScreen />
        </ConfigProvider>
      </DriverProvider>
    </ThemeProvider>
  );
}
