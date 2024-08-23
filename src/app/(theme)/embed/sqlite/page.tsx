import ThemeLayout from "../../theme_layout";
import EmbedPageClient from "./page-client";

export default async function EmbedPage(props: {
  searchParams: {
    theme?: string;
    disableThemeToggle?: string;
    [key: string]: any;
  };
}) {
  let overrideTheme: "dark" | "light" | undefined = undefined;
  const disableToggle = props.searchParams.disableThemeToggle === "1";

  if (props.searchParams.theme) {
    overrideTheme = props.searchParams.theme === "dark" ? "dark" : "light";
  }

  const overrideThemeVariables: Record<string, string> = {};

  for (const key in props.searchParams) {
    if (!key.startsWith("themeVariables[")) {
      continue;
    }

    overrideThemeVariables[key.slice(15, -1)] = props.searchParams[key];
  }

  return (
    <ThemeLayout
      overrideTheme={overrideTheme}
      disableToggle={disableToggle}
      overrideThemeVariables={overrideThemeVariables}
    >
      <EmbedPageClient />
    </ThemeLayout>
  );
}
