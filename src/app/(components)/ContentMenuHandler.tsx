import useMessageListener from "@/hooks/useMessageListener";
import { MessageChannelName } from "@/messages/const";
import { OpenContextMenuOptions } from "@/messages/openContextMenu";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
} from "@/components/ui/context-menu";
import { useEffect, useRef, useState } from "react";

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
        cancelable: false,
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
          onOpenChange={(isOpen) => {
            if (!isOpen) setMenu(undefined);
          }}
        >
          <ContextMenuTrigger ref={contextRef}>
            <div></div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {menu.contextMenu.map((item, menuIndex) => {
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

              return (
                <ContextMenuItem
                  key={menuIndex}
                  onClick={item.onClick}
                  disabled={item.disabled}
                >
                  {item.title}
                </ContextMenuItem>
              );
            })}
          </ContextMenuContent>
        </ContextMenu>
      ) : null}
    </div>
  );
}
