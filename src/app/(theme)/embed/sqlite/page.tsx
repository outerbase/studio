import ThemeLayout from "../../theme_layout";
import EmbedPageClient from "./page-client";

export default async function EmbedPage(props: {
  searchParams: { theme?: string; disableThemeToggle?: string };
}) {
  let overrideTheme: "dark" | "light" | undefined = undefined;
  const disableToggle = props.searchParams.disableThemeToggle === "1";

  if (props.searchParams.theme) {
    overrideTheme = props.searchParams.theme === "dark" ? "dark" : "light";
  }

  return (
    <ThemeLayout overrideTheme={overrideTheme} disableToggle={disableToggle}>
      <EmbedPageClient />
    </ThemeLayout>
  );
}
