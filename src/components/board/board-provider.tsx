import { BoardSourceDriver } from "@/drivers/board-source/base-source";
import { createContext, PropsWithChildren, useContext } from "react";

interface BoardContextSettingProps {
  autoRefresh: string[];
  name: string;
}

interface BoardContextProps {
  sources?: BoardSourceDriver;
  setting?: BoardContextSettingProps;
  lastRunTimestamp: number;
}

const BoardContext = createContext<BoardContextProps>({
  lastRunTimestamp: 0,
});

export function useBoardContext() {
  return useContext(BoardContext);
}

export function BoardProvider({
  children,
  sources,
  lastRunTimestamp,
  setting,
}: PropsWithChildren<BoardContextProps>) {
  return (
    <BoardContext.Provider value={{ sources, setting, lastRunTimestamp }}>
      {children}
    </BoardContext.Provider>
  );
}
