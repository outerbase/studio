import { BoardSourceDriver } from "@/drivers/board-source/base-source";
import { noop } from "lodash";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
} from "react";
import { BoardEditorMode, DashboardProps } from ".";
import { ChartValue } from "../chart/chart-type";

interface BoardContextSettingProps {
  autoRefresh: string[];
  name: string;
}

interface BoardContextProps {
  value?: DashboardProps;
  sources?: BoardSourceDriver;
  onAddChart: (value: ChartValue) => Promise<ChartValue | undefined>;
  setting?: BoardContextSettingProps;
  lastRunTimestamp: number;
  setBoardMode: Dispatch<SetStateAction<BoardEditorMode>>;
}

const BoardContext = createContext<BoardContextProps>({
  lastRunTimestamp: 0,
  setBoardMode: noop,
  onAddChart: async () => {
    return undefined;
  },
});

export function useBoardContext() {
  return useContext(BoardContext);
}

export function BoardProvider({
  children,
  ...value
}: PropsWithChildren<BoardContextProps>) {
  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
}
