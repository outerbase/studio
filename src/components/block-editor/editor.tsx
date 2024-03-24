"use client";

import "@blocknote/react/style.css";
import "./style.css";

import { BlockNoteView } from "@blocknote/react";
import { SuggestionMenu } from "./suggestions";
import { BlockNoteEditor } from "@blocknote/core";
import { useTheme } from "@/context/theme-provider";

export interface BlockEditorProps {
  editor: BlockNoteEditor<any>;
}

export function BlockEditor(props: BlockEditorProps) {
  const { theme } = useTheme();

  return (
    <BlockNoteView
      aria-labelledby="block-editor"
      editor={props.editor}
      slashMenu={false}
      theme={theme}
    >
      <SuggestionMenu editor={props.editor} />
    </BlockNoteView>
  );
}
