import CodeMirror, {
  EditorView,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import {
  acceptCompletion,
  completionStatus,
  startCompletion,
} from "@codemirror/autocomplete";
import { sql, SQLite } from "@codemirror/lang-sql";
import { forwardRef, KeyboardEventHandler, useMemo } from "react";

import { defaultKeymap, insertTab } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import { KEY_BINDING } from "@gui/lib/key-matcher";
import useCodeEditorTheme from "./use-editor-theme";
import createSQLTableNameHighlightPlugin from "./sql-tablename-highlight";

interface SqlEditorProps {
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  schema?: Record<string, string[]>;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  onCursorChange?: (
    pos: number,
    lineNumber: number,
    columnNumber: number
  ) => void;
}

const SqlEditor = forwardRef<ReactCodeMirrorRef, SqlEditorProps>(
  function SqlEditor(
    {
      value,
      onChange,
      schema,
      onKeyDown,
      onCursorChange,
      readOnly,
    }: SqlEditorProps,
    ref
  ) {
    const theme = useCodeEditorTheme();

    const tableNameHighlightPlugin = useMemo(() => {
      if (schema) {
        return createSQLTableNameHighlightPlugin(Object.keys(schema));
      }
      return createSQLTableNameHighlightPlugin([]);
    }, [schema]);

    const keyExtensions = useMemo(() => {
      return keymap.of([
        {
          key: KEY_BINDING.run.toCodeMirrorKey(),
          preventDefault: true,
          run: () => true,
        },
        {
          key: "Tab",
          preventDefault: true,
          run: (target) => {
            if (completionStatus(target.state) === "active") {
              acceptCompletion(target);
            } else {
              insertTab(target);
            }
            return true;
          },
        },
        {
          key: "Ctrl-Space",
          mac: "Cmd-i",
          preventDefault: true,
          run: startCompletion,
        },
        ...defaultKeymap,
      ]);
    }, []);

    return (
      <CodeMirror
        ref={ref}
        autoFocus
        readOnly={readOnly}
        onKeyDown={onKeyDown}
        basicSetup={{
          defaultKeymap: false,
          drawSelection: false,
        }}
        theme={theme}
        value={value}
        height="100%"
        onChange={onChange}
        style={{
          fontSize: 20,
          height: "100%",
        }}
        extensions={[
          keyExtensions,
          sql({
            dialect: SQLite,
            schema,
          }),
          tableNameHighlightPlugin,
          EditorView.updateListener.of((state) => {
            const pos = state.state.selection.main.head;
            const line = state.state.doc.lineAt(pos);
            const lineNumber = line.number;
            const columnNumber = pos - line.from;
            if (onCursorChange) onCursorChange(pos, lineNumber, columnNumber);
          }),
        ]}
      />
    );
  }
);

export default SqlEditor;
