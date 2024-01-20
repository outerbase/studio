import React from "react";
import { MessageChannelName } from "./const";

export type OpenContextMenuList = {
  type?: "check";
  checked?: boolean;
  title?: string;
  separator?: boolean;
  disabled?: boolean;
  onClick?: () => void;
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
