export {};
declare global {
  interface Window {
    outerbaseIpc?: any;
    outerbaseOpenTab?: (openTabOption: WindowTabItemProps) => void;
    outerbaseCloseTab?: (keys: string[]) => void;
    outerbaseOpenContextMenu?: (options: OpenContextMenuOptions) => void;
  }
}
