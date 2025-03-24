import ThemeLayout from "@/app/(theme)/theme_layout";
import Chart from "@/components/chart";
import ClientOnly from "@/components/client-only";
import { getOuterbaseEmbedChart } from "@/outerbase-cloud/api";

interface EmbedBoardPageProps {
  params: Promise<{ boardId: string }>;
  searchParams: Promise<{ key: string; theme: string }>;
}

export const runtime = "edge";

export default async function EmbedBoardPage(props: EmbedBoardPageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const result = await getOuterbaseEmbedChart(params.boardId, searchParams.key);
  const data = result.response.result?.items ?? [];

  return (
    <ThemeLayout
      overrideTheme={searchParams.theme === "dark" ? "dark" : "light"}
    >
      <ClientOnly>
        <Chart
          data={data}
          value={result.response as any}
          className="h-screen w-screen"
        />
      </ClientOnly>
    </ThemeLayout>
  );
}
