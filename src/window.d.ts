import { WindowTabItemProps } from "./components/gui/windows-tab";

export {};
declare global {
  interface Window {
    outerbaseIpc?: any;
    outerbaseOpenTab?: (options: WindowTabItemProps) => void;
    outerbaseCloseTab?: (keys: string[]) => void;
    outerbaseOpenContextMenu?: (options: OpenContextMenuOptions) => void;
  }
}
