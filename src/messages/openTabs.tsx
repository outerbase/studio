import { MessageChannelName } from "./const";

export interface OpenTabsProps {
  name: string;
  key: string;
  type: "table" | "query" | "schema";
  tableName?: string;
}

export function openTabs(props: OpenTabsProps) {
  return window.internalPubSub.send(MessageChannelName.OPEN_NEW_TAB, props);
}
