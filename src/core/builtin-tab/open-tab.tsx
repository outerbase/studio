import { WindowTabItemProps } from "@/components/gui/windows-tab";

export default function openUnsafeTab(tabOption: WindowTabItemProps) {
  if (window.outerbaseOpenTab) window.outerbaseOpenTab(tabOption);
}
