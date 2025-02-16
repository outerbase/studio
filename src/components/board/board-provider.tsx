import { BoardSourceDriver } from "@/drivers/board-source/base-source";
import { IBoardStorageDriver } from "@/drivers/board-storage/base";
import { noop } from "lodash";
import {
  createContext,
  Dispatch,
  MutableRefObject,
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
  boardMode: BoardEditorMode;
  filterValue: Record<string, string>;
  onFilterValueChange?: (value: Record<string, string>) => void;
  resolvedFilterValue: Record<string, string>;
  refMainBoard: MutableRefObject<HTMLDivElement | null>;
}

const BoardContext = createContext<BoardContextProps>({
  lastRunTimestamp: 0,
  setBoardMode: noop,
  boardMode: null,
  filterValue: {},
  onFilterValueChange: noop,
  resolvedFilterValue: {},
  refMainBoard: { current: null },
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
