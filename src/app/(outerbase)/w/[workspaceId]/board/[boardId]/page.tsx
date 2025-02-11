"use client";

import { NavigationBar } from "@/app/(outerbase)/nav";
import { useWorkspaces } from "@/app/(outerbase)/workspace-provider";
import Board from "@/components/board";
import OuterbaseBoardStorageDriver from "@/drivers/board-storage/outerbase";

import { getOuterbaseDashboard } from "@/outerbase-cloud/api";
import { OuterbaseAPIDashboardDetail } from "@/outerbase-cloud/api-type";
import OuterbaseBoardSourceDriver from "@/outerbase-cloud/database-source";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR, { KeyedMutator } from "swr";

function BoardPageEditor({
  initialValue,
  mutate,
}: {
  initialValue: OuterbaseAPIDashboardDetail;
  mutate: KeyedMutator<OuterbaseAPIDashboardDetail>;
}) {
  const { boardId } = useParams<{
    workspaceId: string;
    boardId: string;
  }>();
  const { currentWorkspace } = useWorkspaces();
  const [interval, setIntervals] = useState<number>(0);

  const boardSources = useMemo(() => {
    if (!currentWorkspace) return;
    return new OuterbaseBoardSourceDriver(currentWorkspace);
  }, [currentWorkspace]);

  const storageDriver = useMemo(() => {
    if (!currentWorkspace) return;
    return new OuterbaseBoardStorageDriver(
      currentWorkspace.short_name,
      boardId
    );
  }, [currentWorkspace]);

  const [value, setValue] = useState(initialValue);

  // const onSave = useCallback(() => {
  //   boardSources?.onLayoutSave(boardId, value).then().finally(mutate);
  // }, [boardSources, boardId, value, mutate]);

  // const onRemove = useCallback(
  //   async (key: string) => {
  //     const chart = value.charts.find((f) => f.id === key);
  //     if (chart) {
  //       const deleteChartId = await deleteChartDialog.show({
  //         chartId: key,
  //         chartName: chart.name,
  //         boardId,
  //         value,
  //         source: boardSources,
  //       });

  //       if (deleteChartId) {
  //         setValue((prev) => {
  //           return produce(prev, (draft) => {
  //             draft.chart_ids = prev.chart_ids.filter(
  //               (f) => f !== deleteChartId
  //             );
  //             draft.layout = prev.layout.filter((f) => f.i !== deleteChartId);
  //             draft.charts = prev.charts.filter((f) => f.id !== deleteChartId);
  //           });
  //         });
  //         mutate();
  //       }
  //     }
  //   },
  //   [value, boardId, boardSources, mutate]
  // );

  // const onAddChart = useCallback(
  //   async (chartValue: ChartValue) => {
  //     return boardSources?.onAddChart(boardId, chartValue, value);
  //   },
  //   [boardId, boardSources, value]
  // );

  if (!boardSources) {
    return <div>Loading Workspace....</div>;
  }

  return (
    <Board
      value={value as any}
      onChange={setValue as any}
      sources={boardSources}
      storage={storageDriver}
      interval={interval}
      onChangeInterval={setIntervals}
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
