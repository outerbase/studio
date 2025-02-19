"use client";
import NavigationDashboardLayout from "@/app/(outerbase)/nav-board-layout";
import { SavedConnectionLocalStorage } from "@/app/(theme)/connect/saved-connection-storage";
import Board, { DashboardProps } from "@/components/board";
import { BoardSourceDriver } from "@/drivers/board-source/base-source";
import LocalBoardSource from "@/drivers/board-source/local";
import LocalBoardStorage from "@/drivers/board-storage/local";
import { LocalDashboardData } from "@/indexdb";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLocalDashboardList } from "../../hooks";

function LocalBoardWithDataPage({
  initialValue,
}: {
  initialValue: LocalDashboardData;
}) {
  const [interval, setIntervals] = useState<number>(0);
  const [filter, setFilter] = useState({});
  const [value, setValue] = useState<DashboardProps>(initialValue);

  const [boardSources, setBoardSources] = useState<BoardSourceDriver>();
  const boardStorage = useMemo(() => {
    return new LocalBoardStorage(initialValue);
  }, [initialValue]);

  // Loading the local board source
  useEffect(() => {
    const sources = SavedConnectionLocalStorage.getDetailList();
    setBoardSources(new LocalBoardSource(sources));
  }, []);

  if (!boardSources) return <div>Loading</div>;

  return (
    <Board
      value={value}
      onChange={setValue}
      storage={boardStorage}
      filterValue={filter}
      onFilterValueChange={setFilter}
      sources={boardSources}
      interval={interval}
      onChangeInterval={setIntervals}
    />
  );
}

export default function LocalBoardPage() {
  const { boardId } = useParams<{
    boardId: string;
  }>();

  const { data, isLoading } = useLocalDashboardList();
  const board = data?.find((b) => b.id === boardId);

  const dashboardList = useMemo(() => {
    return (data ?? []).map((board) => {
      return {
        href: `/local/board/${board.id}`,
        name: board.content.name,
        id: board.id,
      };
    });
  }, [data]);

  if (!board) return <div>Loading...</div>;

  return (
    <NavigationDashboardLayout
      boards={dashboardList}
      workspaceName="Local"
      loading={isLoading}
      backHref="/local"
    >
      <LocalBoardWithDataPage initialValue={board.content} />
    </NavigationDashboardLayout>
  );
}
