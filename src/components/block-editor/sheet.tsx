"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { Block, schema, uploadFile } from "./extensions";
import { Sheet, SheetContent } from "../ui/sheet";
import { useCallback, useMemo, useRef, useState } from "react";
import { noop } from "@/lib/utils";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { BlockEditor } from "./editor";
import { BlockContent, CONTENT_FORMAT } from ".";

export interface BlockEditorSheetProps {
  initialContent?: BlockContent<Block>;
  open: boolean;
  onSave: (json: string) => void;
  onCancel: () => void;
}

export function BlockEditorSheet({
  onCancel,
  onSave,
  open,
  initialContent,
}: BlockEditorSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  console.log("initialContent", initialContent);

  const editor = useCreateBlockNote(
    {
      uploadFile,
      schema,
      initialContent: initialContent?.content,
    },
    [initialContent],
  );

  const handleSave = useCallback(() => {
    const blockContent: BlockContent<Block> = {
      format: CONTENT_FORMAT.BLOCK_NOTE,
      content: editor.document,
    };
    onSave(JSON.stringify(blockContent));
  }, [onSave, editor]);

  return (
    <Sheet open={open}>
      <SheetContent
        onInteractOutside={() => {
          // shake the container to indicate the user that the sheet is not closable
          containerRef.current?.classList.add("animate-shake");
          setTimeout(() => {
            containerRef.current?.classList.remove("animate-shake");
          }, 500);
        }}
        className="p-5 py-8 border-none sm:max-w-3xl bg-transparent flex"
      >
        <div
          ref={containerRef}
          className="bg-background flex flex-col rounded-3xl py-6 px-7 flex-1"
        >
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">Block Editor</div>
            <div className="flex gap-x-2">
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>

          <Separator className="my-5" />

          <ScrollArea className="flex-1">
            <div>
              <BlockEditor editor={editor} />
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function useBlockEditorSheet() {
  const [open, setOpen] = useState(false);

  const [initialContent, setInitialContent] = useState<BlockContent | undefined>(
    undefined,
  );

  const [callbacks, setCallbacks] = useState<{
    onSave: (json: string) => void;
    onCancel: () => void;
  }>({
    onSave: noop,
    onCancel: noop,
  });

  const handlers = useMemo(
    () => ({
      onSave: (callback: (json: string) => void) => {
        setCallbacks((prev) => ({ ...prev, onSave: callback }));
      },
      onCancel: (callback: () => void) => {
        setCallbacks((prev) => ({ ...prev, onCancel: callback }));
      },
      initialBlocks: (jsonBlocks: string) => {
        try {
          const blocks = JSON.parse(jsonBlocks);
          console.log("blocks", blocks);
          setInitialContent(blocks);
        } catch (e) {
          console.error("Invalid initial blocks", e);
        }
      },
      reset: () => {
        setInitialContent(undefined);
        setCallbacks({
          onSave: noop,
          onCancel: noop,
        });
        setOpen(false);
      },
      open: () => setOpen(true),
      close: () => setOpen(false),
      toggle: () => setOpen((prev) => !prev),
    }),
    [setOpen, setInitialContent, setCallbacks],
  );

  const onSave = useCallback(
    (json: string) => {
      callbacks.onSave(json);
      setOpen(false);
    },
    [setOpen, callbacks],
  );

  const onCancel = useCallback(() => {
    callbacks.onCancel();
    setOpen(false);
  }, [setOpen, callbacks]);

  return {
    handlers,
    blockEditorSheetProps: { open, onSave, onCancel, initialContent },
  };
}
