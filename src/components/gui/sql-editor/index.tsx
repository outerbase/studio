"use client";
import {
  acceptCompletion,
  completionStatus,
  startCompletion,
} from "@codemirror/autocomplete";
import {
  MySQL as MySQLDialect,
  PostgreSQL as PostgresDialect,
  sql,
  SQLNamespace,
} from "@codemirror/lang-sql";
import { indentUnit, LanguageSupport } from "@codemirror/language";
import CodeMirror, {
  EditorView,
  Extension,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { forwardRef, KeyboardEventHandler, useEffect, useMemo } from "react";

import {
  CodeMirrorPromptPlugin,
  PromptCallback,
} from "@/components/editor/prompt-plugin";
import { createVariableHighlightPlugin } from "@/components/editor/sql-editor/variable-highlight-plugin";
import AgentDriverList from "@/drivers/agent/list";
import { SupportedDialect } from "@/drivers/base-driver";
import sqliteFunctionList from "@/drivers/sqlite/function-tooltip.json";
import { sqliteDialect } from "@/drivers/sqlite/sqlite-dialect";
import { KEY_BINDING } from "@/lib/key-matcher";
import { defaultKeymap, insertTab } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import { toast } from "sonner";
import { functionTooltip } from "./function-tooltips";
import createSQLTableNameHighlightPlugin from "./sql-tablename-highlight";
import SqlStatementHighlightPlugin from "./statement-highlight";
import useCodeEditorTheme from "./use-editor-theme";

interface SqlEditorProps {
  highlightVariable?: boolean;

  /**
   * Comma seprated variable name list
   */
  variableList?: string;

  /**
   * Prompt Support
   */
  onPrompt?: PromptCallback;
  agents?: AgentDriverList;

  value: string;
  dialect: SupportedDialect;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  schema?: SQLNamespace;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  fontSize?: number;
  onFontSizeChanged?: (fontSize: number) => void;
  onCursorChange?: (
    pos: number,
    lineNumber: number,
    columnNumber: number
  ) => void;
}

const SqlEditor = forwardRef<ReactCodeMirrorRef, SqlEditorProps>(
  function SqlEditor(
    {
      dialect,
      value,
      onChange,
      schema,
      onKeyDown,
      onCursorChange,
      readOnly,
      fontSize,
      agents,
      onFontSizeChanged,
      variableList,
      highlightVariable,
      onPrompt,
    }: SqlEditorProps,
    ref
  ) {
    const theme = useCodeEditorTheme({ fontSize });

    const tableNameHighlightPlugin = useMemo(() => {
      if (schema) {
        return createSQLTableNameHighlightPlugin(Object.keys(schema));
      }
      return createSQLTableNameHighlightPlugin([]);
    }, [schema]);

    const promptPlugin = useMemo(() => {
      return agents ? new CodeMirrorPromptPlugin() : null;
    }, [agents]);

    useEffect(() => {
      if (promptPlugin && onPrompt) {
        promptPlugin.handleSuggestion(onPrompt);
        promptPlugin.agents = agents;
      }
    }, [promptPlugin, onPrompt, agents]);

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
        {
          key: "Ctrl-=",
          mac: "Cmd-=",
          preventDefault: true,
          run: () => {
            if (onFontSizeChanged) {
              const newFontSize = Math.min(2, (fontSize ?? 1) + 0.2);
              onFontSizeChanged(newFontSize);
              toast.info(
                `Change code editor font size to ${Math.floor(newFontSize * 100)}%`,
                { duration: 1000, id: "font-size" }
              );
            }
            return true;
          },
        },
        {
          key: "Ctrl--",
          mac: "Cmd--",
          preventDefault: true,
          run: () => {
            if (onFontSizeChanged) {
              const newFontSize = Math.max(0.4, (fontSize ?? 1) - 0.2);
              onFontSizeChanged(newFontSize);
              toast.info(
                `Change code editor font size to ${Math.floor(newFontSize * 100)}%`,
                { duration: 1000, id: "font-size" }
              );
            }
            return true;
          },
        },
        ...defaultKeymap,
      ]);
    }, [fontSize, onFontSizeChanged]);

    const extensions = useMemo(() => {
      let sqlDialect: LanguageSupport | undefined = undefined;
      let tooltipExtension: Extension | undefined = undefined;

      if (dialect === "sqlite") {
        sqlDialect = sql({
          dialect: sqliteDialect,
          schema,
        });
        tooltipExtension = functionTooltip(sqliteFunctionList);
      } else if (dialect === "postgres") {
        sqlDialect = sql({
          dialect: PostgresDialect,
          schema,
        });
      } else {
        sqlDialect = sql({
          dialect: MySQLDialect,
          schema,
        });
      }

      return [
        EditorView.baseTheme({
          "& .cm-line": {
            borderLeft: "3px solid transparent",
            paddingLeft: "10px",
          },
          "& .cm-focused": {
            outline: "none !important",
          },
        }),
        keyExtensions,
        indentUnit.of("  "),
        highlightVariable
          ? createVariableHighlightPlugin({
              variables: variableList ?? "",
              language: sqlDialect,
            })
          : undefined,
        sqlDialect,
        tooltipExtension,
        tableNameHighlightPlugin,
        SqlStatementHighlightPlugin,
        EditorView.updateListener.of((state) => {
          const pos = state.state.selection.main.head;
          const line = state.state.doc.lineAt(pos);
          const lineNumber = line.number;
          const columnNumber = pos - line.from;
          if (onCursorChange) onCursorChange(pos, lineNumber, columnNumber);
        }),
        promptPlugin ? promptPlugin.getExtensions() : undefined,
      ].filter(Boolean) as Extension[];
    }, [
      dialect,
      onCursorChange,
      keyExtensions,
      schema,
      tableNameHighlightPlugin,
      variableList,
      highlightVariable,
      promptPlugin,
    ]);

    return (
      <CodeMirror
        ref={ref}
        autoFocus={!readOnly}
        readOnly={readOnly}
        onKeyDown={onKeyDown}
        basicSetup={{
          defaultKeymap: false,
          drawSelection: false,
        }}
        theme={theme}
        indentWithTab={false}
        value={value}
        height="100%"
        onChange={onChange}
        style={{
          fontSize: 20,
          height: "100%",
        }}
        extensions={extensions}
      />
    );
  }
);

export default SqlEditor;
