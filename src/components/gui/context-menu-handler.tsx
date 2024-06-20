import useMessageListener from "@/hooks/useMessageListener";
import { MessageChannelName } from "@/messages/const";
import type {
  OpenContextMenuList,
  OpenContextMenuOptions,
} from "@/messages/open-context-menu";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import { useEffect, useRef, useState } from "react";

function ContextMenuList({ menu }: { menu: OpenContextMenuList }) {
  return menu.map((item, menuIndex) => {
    if (item.separator) {
      return <ContextMenuSeparator key={menuIndex} />;
    }

    if (item.type === "check") {
      return (
        <ContextMenuCheckboxItem
          key={menuIndex}
          checked={item.checked}
          onClick={item.onClick}
          disabled={item.disabled}
        >
          {item.title}
        </ContextMenuCheckboxItem>
      );
    }

    if (item.sub) {
      return (
        <ContextMenuSub key={menuIndex}>
          <ContextMenuSubTrigger inset>{item.title}</ContextMenuSubTrigger>
          <ContextMenuSubContent
            className={!item.subWidth ? "w-48" : ""}
            style={{ width: item.subWidth ? undefined : item.subWidth }}
          >
            <ContextMenuList menu={item.sub} />
          </ContextMenuSubContent>
        </ContextMenuSub>
      );
    }

    return (
      <ContextMenuItem
        key={menuIndex}
        onClick={item.onClick}
        disabled={item.disabled}
        inset={!item.icon}
      >
        {item.icon && <item.icon className="w-4 h-4 mr-2" />}
        {item.destructive ? (
          <span className="text-red-500">{item.title}</span>
        ) : (
          item.title
        )}
        {item.shortcut && (
          <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>
        )}
      </ContextMenuItem>
    );
  });
}

export default function ContextMenuHandler() {
  const contextRef = useRef<HTMLSpanElement>(null);
  const [menu, setMenu] = useState<OpenContextMenuOptions>();

  useMessageListener<OpenContextMenuOptions>(
    MessageChannelName.OPEN_CONTEXT_MENU,
    (options) => {
      if (options) {
        setMenu(options);
      }
    }
  );

  useEffect(() => {
    if (menu && contextRef.current) {
      const ev = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 2,
        buttons: 2,
        clientX: menu.x,
        clientY: menu.y,
      });

      contextRef.current.dispatchEvent(ev);
    }
  }, [menu, contextRef]);

  return (
    <div style={{ position: "fixed", left: -20, top: -20 }}>
      {menu ? (
        <ContextMenu
          modal={false}
          onOpenChange={(isOpen) => {
            if (!isOpen) setMenu(undefined);
          }}
        >
          <ContextMenuTrigger ref={contextRef}>
            <div></div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuList menu={menu.contextMenu} />
          </ContextMenuContent>
        </ContextMenu>
      ) : null}
    </div>
  );
}
