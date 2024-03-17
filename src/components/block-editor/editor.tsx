import "@blocknote/react/style.css";
import "./style.css";

import { BlockNoteView } from "@blocknote/react";
import { SuggestionMenu } from "./suggestions";
import { BlockNoteEditor } from "@blocknote/core";

export interface BlockEditorProps {
  editor: BlockNoteEditor<any>;
}

export function BlockEditor(props: BlockEditorProps) {
  return (
    <BlockNoteView
      aria-labelledby="block-editor"
      editor={props.editor}
      slashMenu={false}
      theme="light"
    >
      <SuggestionMenu editor={props.editor} />
    </BlockNoteView>
  );
}
