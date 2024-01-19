import { MessageChannelName } from "./const";

export interface OpenTabsProps {
  name: string;
  key: string;
  type: "table" | "query";
  tableName?: string;
}

export function openTabs(props: OpenTabsProps) {
  return window.postMessage({
    channel: MessageChannelName.OPEN_NEW_TAB,
    data: props,
  });
}
