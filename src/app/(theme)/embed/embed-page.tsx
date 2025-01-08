import { ReactElement } from "react";
import ThemeLayout from "../theme_layout";

export interface EmbedPageProps {
  searchParams: Promise<{
    theme?: string;
    disableThemeToggle?: string;
    [key: string]: any;
  }>;
}

export function createEmbedPage(render: () => ReactElement) {
  return async function EmbedPage(props: EmbedPageProps) {
    const searchParams = await props.searchParams;

    let overrideTheme: "dark" | "light" | undefined = undefined;
    const disableToggle = searchParams.disableThemeToggle === "1";

    if (searchParams.theme) {
      overrideTheme = searchParams.theme === "dark" ? "dark" : "light";
    }

    const overrideThemeVariables: Record<string, string> = {};

    for (const key in searchParams) {
      if (!key.startsWith("themeVariables[")) {
        continue;
      }

      overrideThemeVariables[key.slice(15, -1)] = searchParams[key];
    }

    return (
      <ThemeLayout
        overrideTheme={overrideTheme}
        disableToggle={disableToggle}
        overrideThemeVariables={overrideThemeVariables}
      >
        {render()}
      </ThemeLayout>
    );
  };
}
