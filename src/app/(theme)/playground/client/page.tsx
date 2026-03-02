import ClientOnly from "@/components/client-only";
import ThemeLayout from "../../theme_layout";
import PlaygroundEditorBody from "./page-client";

interface PlaygroundEditorProps {
  searchParams: Promise<{ template?: string; url?: string }>;
}

export default async function PlaygroundEditor(props: PlaygroundEditorProps) {
  const searchParams = await props.searchParams;
  const templateName = searchParams.template;
  let templateFile: string | null = null;

  // We will hardcode the template given that we already removed the database
  // but we want to keep the template working.

  if (templateName) {
    if (templateName === "chinook") {
      templateFile = "https://r2.invisal.com/sample/chinook.db";
    } else if (templateName === "northwind") {
      templateFile = "https://r2.invisal.com/sample/northwind.db";
    }
  } else if (searchParams.url) {
    templateFile = searchParams.url;
  }

  return (
    <ThemeLayout>
      <ClientOnly>
        <PlaygroundEditorBody preloadDatabase={templateFile} />
      </ClientOnly>
    </ThemeLayout>
  );
}
