import ClientOnly from "@/components/client-only";
import ThemeLayout from "../../theme_layout";
import EmbedPageClient from "./page-client";

export interface EmbedPageProps {
  searchParams: Promise<{
    theme?: string;
    disableThemeToggle?: string;
    [key: string]: any;
  }>;
  params: Promise<{
    driver: string;
  }>;
}

export const runtime = "edge";

export default async function EmbedPage(props: EmbedPageProps) {
  const searchParams = await props.searchParams;
  const driver = (await props.params).driver;

  let overrideTheme: "dark" | "light" | undefined = undefined;

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
      overrideThemeVariables={overrideThemeVariables}
    >
      <ClientOnly>
        <EmbedPageClient driverName={driver} />
      </ClientOnly>
    </ThemeLayout>
  );
}
