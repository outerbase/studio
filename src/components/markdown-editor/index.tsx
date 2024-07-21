"use client";
import { Suspense, useEffect, useRef } from "react";
import {
  $getRoot,
  $getSelection,
  LexicalEditor,
  $setSelection,
  $addUpdateTag,
} from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";

import { ListItemNode, ListNode } from "@lexical/list";

import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";

const initialMarkdown = "This is **markdown**";

function MarkdownPreview() {
  const mdRef = useRef<HTMLTextAreaElement>(null);
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState, tags }) => {
      if (!tags.has("from-markdown-preview")) {
        editorState.read(() => {
          if (mdRef.current) {
            mdRef.current.value = $convertToMarkdownString(TRANSFORMERS);
          }
        });
      }
    });
  }, [editor]);

  return (
    <textarea
      className="w-1/2 outline-none p-4 border-r"
      ref={mdRef}
      defaultValue={initialMarkdown}
      onChange={(e) => {
        editor.update(() => {
          $convertFromMarkdownString(e.currentTarget.value, TRANSFORMERS);
          $setSelection(null);
          $addUpdateTag("from-markdown-preview");
        });
      }}
    />
  );
}

export default function MarkdownEditor() {
  return (
    <div className="flex flex-col grow w-full h-full">
      <div className="border-b p-2">Hello World</div>
      <div className="grow">
        <Suspense>
          <LexicalComposer
            initialConfig={{
              namespace: "md",
              onError: console.error,
              theme: {
                list: {
                  ul: "p-4 ml-4 list-disc",
                },
              },
              nodes: [ListNode, ListItemNode],
              editorState: (editor) => {
                $convertFromMarkdownString(initialMarkdown, TRANSFORMERS);
              },
            }}
          >
            <MarkdownPreview />
            <RichTextPlugin
              contentEditable={<ContentEditable className="lex" />}
              placeholder={<div>Enter some text...</div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <OnChangePlugin
              onChange={(state) => {
                // state.read(() => {
                //   if (mdEditorRef.current) {
                //     mdEditorRef.current.value =
                //       $convertToMarkdownString(TRANSFORMERS);
                //   }
                // });
              }}
            />
          </LexicalComposer>
        </Suspense>
      </div>
    </div>
  );
}
