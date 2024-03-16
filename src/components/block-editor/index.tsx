"use client";

import "@blocknote/react/style.css";
import "./style.css";

import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import { schema, uploadFile } from "./extensions";
import { SuggestionMenu } from "./suggestions";

export function BlockEditor() {
  const editor = useCreateBlockNote({
    uploadFile,
    schema,
    initialContent: [
      {
        type: "codeBlock",
        props: {
          language: "javascript",
          code: "const print = (msg) => console.log(msg);",
        }
      }
    ]
  });

  return (
    <BlockNoteView aria-labelledby="block-editor" editor={editor} slashMenu={false}>
      <SuggestionMenu editor={editor} />
    </BlockNoteView>
  );
}
