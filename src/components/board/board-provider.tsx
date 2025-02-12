import { BoardSourceDriver } from "@/drivers/board-source/base-source";
import { IBoardStorageDriver } from "@/drivers/board-storage/base";
import { noop } from "lodash";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
} from "react";
import { BoardEditorMode, DashboardProps } from ".";

interface BoardContextSettingProps {
  autoRefresh: string[];
  name: string;
}

interface BoardContextProps {
  value?: DashboardProps;
  onChange?: (value: DashboardProps) => void;
  sources?: BoardSourceDriver;
  storage?: IBoardStorageDriver;
  setting?: BoardContextSettingProps;
  lastRunTimestamp: number;
  setBoardMode: Dispatch<SetStateAction<BoardEditorMode>>;
  filterValue: Record<string, string>;
  onFilterValueChange?: (value: Record<string, string>) => void;
}

const BoardContext = createContext<BoardContextProps>({
  lastRunTimestamp: 0,
  setBoardMode: noop,
  filterValue: {},
  onFilterValueChange: noop,
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
