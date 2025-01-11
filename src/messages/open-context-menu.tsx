import type { LucideIcon } from "lucide-react";

export interface StudioContextMenuItem {
  type?: "check";
  checked?: boolean;
  title?: string | JSX.Element;
  shortcut?: string;
  separator?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  onClick?: () => void;
  sub?: OpenContextMenuList;
  subWidth?: number;
  icon?: LucideIcon;
}

export type OpenContextMenuList = Array<StudioContextMenuItem>;

export interface OpenContextMenuOptions {
  contextMenu: OpenContextMenuList;
  x: number;
  y: number;
}

export function openContextMenu(options: OpenContextMenuOptions) {
  if (window.outerbaseOpenContextMenu) {
    window.outerbaseOpenContextMenu(options);
  }
}

export function openContextMenuFromEvent(contextMenu: OpenContextMenuList) {
  return function handleMouseEvent(e: React.MouseEvent) {
    openContextMenu({
      contextMenu,
      x: e.pageX,
      y: e.pageY,
    });

    e.preventDefault();
    return false;
  };
}
