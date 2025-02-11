"use client";

import { NavigationBar } from "@/app/(outerbase)/nav";
import { useWorkspaces } from "@/app/(outerbase)/workspace-provider";
import Board from "@/components/board";
import { deleteChartDialog } from "@/components/board/board-delete-dialog";
import { ChartValue } from "@/components/chart/chart-type";

import { getOuterbaseDashboard } from "@/outerbase-cloud/api";
import { createOuterbaseDashboardChart } from "@/outerbase-cloud/api-board";
import { OuterbaseAPIDashboardDetail } from "@/outerbase-cloud/api-type";
import OuterbaseBoardSourceDriver from "@/outerbase-cloud/database-source";
import { produce } from "immer";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import useSWR, { KeyedMutator } from "swr";

function BoardPageEditor({
  initialValue,
  mutate,
}: {
  initialValue: OuterbaseAPIDashboardDetail;
  mutate: KeyedMutator<OuterbaseAPIDashboardDetail>;
}) {
  const { workspaceId, boardId } = useParams<{
    workspaceId: string;
    boardId: string;
  }>();
  const { workspaces } = useWorkspaces();
  const [interval, setIntervals] = useState<number>(0);

  const boardSources = useMemo(() => {
    if (workspaces.length === 0) return;
    return new OuterbaseBoardSourceDriver(
      workspaces.find(
        (w) => w.id === workspaceId || w.short_name === workspaceId
      )!
    );
  }, [workspaceId, workspaces]);

  const [value, setValue] = useState(initialValue);

  const onSave = useCallback(() => {
    boardSources?.onLayoutSave(boardId, value).then().finally(mutate);
  }, [boardSources, boardId, value, mutate]);

  const onRemove = useCallback(
    async (key: string) => {
      const chart = value.charts.find((f) => f.id === key);
      if (chart) {
        const deleteChartId = await deleteChartDialog.show({
          chartId: key,
          chartName: chart.name,
          boardId,
          value,
          source: boardSources,
        });

        if (deleteChartId) {
          setValue((prev) => {
            return produce(prev, (draft) => {
              draft.chart_ids = prev.chart_ids.filter(
                (f) => f !== deleteChartId
              );
              draft.layout = prev.layout.filter((f) => f.i !== deleteChartId);
              draft.charts = prev.charts.filter((f) => f.id !== deleteChartId);
            });
          });
          mutate();
        }
      }
    },
    [value, boardId, boardSources, mutate]
  );

  const onAddChart = useCallback(
    async (chartValue: ChartValue) => {
      if (!chartValue.source_id) return;
      if (!chartValue.type) return;

      return createOuterbaseDashboardChart(workspaceId, {
        source_id: chartValue.source_id,
        params: {
          ...chartValue.params,
          source_id: chartValue.source_id,
          workspace_id: workspaceId,
          layers: chartValue.params.layers.map((layer) => {
            return {
              ...layer,
              type: chartValue.type!,
            };
          }),
        },
        type: chartValue.type,
        name: chartValue.name ?? "",
      });
    },
    [workspaceId]
  );

  if (!boardSources) {
    return <div>Loading Workspace....</div>;
  }

  return (
    <Board
      value={value as any}
      onChange={setValue as any}
      sources={boardSources}
      interval={interval}
      onChangeInterval={setIntervals}
      onLayoutCancel={() => setValue(initialValue)}
      onLayoutSave={onSave}
      onRemove={onRemove}
      onAddChart={onAddChart}
    />
  );
}

export default function BoardPage() {
  const { workspaceId, boardId } = useParams<{
    boardId: string;
    workspaceId: string;
  }>();
  const { data, mutate } = useSWR(`board-${boardId}`, () => {
    return getOuterbaseDashboard(workspaceId, boardId);
  });

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <NavigationBar />
      <div className="flex flex-1 overflow-x-hidden overflow-y-auto">
        <BoardPageEditor initialValue={data} mutate={mutate} />
      </div>
    </div>
  );
}
