import CodeMirror from "@uiw/react-codemirror";
import { sql, SQLite } from "@codemirror/lang-sql";

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SqlEditor({ value, onChange }: SqlEditorProps) {
  return (
    <CodeMirror
      autoFocus
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
        }),
      ]}
    />
  );
}
