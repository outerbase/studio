import React from "react";
import { MessageChannelName } from "./const";
import { LucideIcon } from "lucide-react";

export type OpenContextMenuList = {
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
}[];

export interface OpenContextMenuOptions {
  contextMenu: OpenContextMenuList;
  x: number;
  y: number;
}

export function openContextMenu(options: OpenContextMenuOptions) {
  return window.internalPubSub.send(
    MessageChannelName.OPEN_CONTEXT_MENU,
    options
  );
}

export function openContextMenuFromEvent(contextMenu: OpenContextMenuList) {
  return function handleMouseEvent(e: React.MouseEvent) {
    openContextMenu({
      contextMenu,
      x: e.pageX,
      y: e.pageY,
    });

    e.preventDefault();
    e.stopPropagation();
    return false;
  };
}
