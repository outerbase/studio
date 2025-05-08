import { DatabaseTableSchema } from "@/drivers/base-driver";
import { autocompletion } from "@codemirror/autocomplete";
import { SQLDialect } from "@codemirror/lang-sql";
import ReactCodeMirror, { Extension } from "@uiw/react-codemirror";
import { useMemo } from "react";
import useCodeEditorTheme from "../gui/sql-editor/use-editor-theme";

interface SQLWhereEditorProps {
  schema?: DatabaseTableSchema;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function SQLWhereEditor({
  schema,
  value,
  onChange,
  placeholder,
}: SQLWhereEditorProps) {
  const theme = useCodeEditorTheme({});

  const extensions = useMemo(() => {
    const extensions: Extension[] = [theme];

    const sqlExtension = SQLDialect.define({
      keywords: "and or like between",
    });
    extensions.push(sqlExtension);

    if (schema) {
      extensions.push(
        autocompletion({
          override: [
            (context) => {
              const word = context.matchBefore(/\w*/);
              if (!word || (word.from === word.to && !context.explicit))
                return null;
              return {
                from: word.from,
                options: schema.columns
                  .map((column) => column.name)
                  .map((keyword) => ({
                    label: keyword,
                    type: "property",
                  })),
              };
            },
          ],
        })
      );
    }

    return extensions;
  }, [schema, theme]);

  return (
    <ReactCodeMirror
      placeholder={placeholder}
      className="w-full"
      basicSetup={false}
      extensions={[extensions]}
      value={value}
      onChange={onChange}
    />
  );
}
