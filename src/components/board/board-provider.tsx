import { BoardSourceDriver } from "@/drivers/board-source/base-source";
import { noop } from "lodash";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
} from "react";
import { BoardEditorMode } from ".";

interface BoardContextSettingProps {
  autoRefresh: string[];
  name: string;
}

interface BoardContextProps {
  sources?: BoardSourceDriver;
  setting?: BoardContextSettingProps;
  lastRunTimestamp: number;
  setBoardMode: Dispatch<SetStateAction<BoardEditorMode>>;
}

const BoardContext = createContext<BoardContextProps>({
  lastRunTimestamp: 0,
  setBoardMode: noop,
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
