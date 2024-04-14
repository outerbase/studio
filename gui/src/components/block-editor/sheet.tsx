"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { Block, schema, uploadFile } from "./extensions";
import { Sheet, SheetContent } from "../ui/sheet";
import { useCallback, useRef } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { BlockEditor } from "./editor";
import { BlockContent, CONTENT_FORMAT } from ".";
import { BlockEditorConfigs } from "@/contexts/block-editor-provider";

export interface BlockEditorSheetProps {
  configs: BlockEditorConfigs | null;
  open: boolean;
}

export function BlockEditorSheet({ configs, open }: BlockEditorSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useCreateBlockNote(
    {
      uploadFile,
      schema,
      initialContent: configs?.initialContent?.content,
    },
    [configs?.initialContent?.content]
  );

  const handleSave = useCallback(() => {
    const blockContent: BlockContent<Block> = {
      format: CONTENT_FORMAT.BLOCK_NOTE,
      content: editor.document,
    };
    configs?.onSave(JSON.stringify(blockContent));
  }, [configs, editor]);

  return (
    <Sheet open={open}>
      <SheetContent
        hideCloseButton
        onInteractOutside={() => {
          // shake the container to indicate the user that the sheet is not closable
          containerRef.current?.classList.add("animate-shake");
          setTimeout(() => {
            containerRef.current?.classList.remove("animate-shake");
          }, 500);
        }}
        className="border-none sm:max-w-[1000px] sm:w-[70vw] bg-transparent flex p-0"
      >
        <div
          ref={containerRef}
          className="bg-background flex flex-col py-6 px-7 flex-1 border"
        >
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">Block Editor</div>
            <div className="flex gap-x-2">
              <Button variant="secondary" onClick={configs?.onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>

          <Separator className="my-5" />

          <ScrollArea className="flex-1">
            <div className="w-full">
              <BlockEditor editor={editor} />
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
