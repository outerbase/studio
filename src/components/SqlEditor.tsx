import { tags as t } from "@lezer/highlight";
import { createTheme } from "@uiw/codemirror-themes";
import CodeMirror from "@uiw/react-codemirror";
import { sql, SQLite } from "@codemirror/lang-sql";

const theme = createTheme({
  theme: "light",
  settings: {
    background: "#FFFFFF",
    foreground: "#000000",
    caret: "#FBAC52",
    selection: "#FFD420",
    selectionMatch: "#FFD420",
    gutterBackground: "#fff",
    gutterForeground: "#4D4D4C",
    gutterBorder: "transparent",
    lineHighlight: "#00000012",
    fontFamily:
      'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
  },
  styles: [
    { tag: [t.meta, t.comment], color: "#804000" },
    { tag: [t.keyword, t.strong], color: "#0000FF" },
    { tag: [t.number], color: "#FF0080" },
    { tag: [t.string], color: "#e17055" },
    { tag: [t.variableName], color: "#006600" },
    { tag: [t.escape], color: "#33CC33" },
    { tag: [t.tagName], color: "#1C02FF" },
    { tag: [t.heading], color: "#0C07FF" },
    { tag: [t.quote], color: "#000000" },
    { tag: [t.list], color: "#B90690" },
    { tag: [t.documentMeta], color: "#888888" },
    { tag: [t.function(t.variableName)], color: "#0000A2" },
    { tag: [t.definition(t.typeName), t.typeName], color: "#6D79DE" },
  ],
});

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  schema?: Record<string, string[]>;
}

export default function SqlEditor({ value, onChange, schema }: SqlEditorProps) {
  return (
    <CodeMirror
      autoFocus
      theme={theme}
      value={value}
      height="100%"
      onChange={onChange}
      style={{
        fontSize: 20,
        height: "100%",
      }}
      extensions={[
        sql({
          dialect: SQLite,
          schema,
        }),
      ]}
    />
  );
}
