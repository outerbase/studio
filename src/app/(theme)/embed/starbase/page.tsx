import ThemeLayout from "../../theme_layout";
import EmbedPageClient from "./page-client";

export default async function EmbedPage() {
  return (
    <ThemeLayout overrideTheme={"dark"} disableToggle={true}>
      <EmbedPageClient />
    </ThemeLayout>
  );
}
