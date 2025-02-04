import { json } from "@codemirror/lang-json";
import { tags as t } from "@lezer/highlight";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import createTheme from "@uiw/codemirror-themes";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { forwardRef, useMemo } from "react";

interface JsonEditorProps {
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

function useJsonTheme() {
  const { resolvedTheme, forcedTheme } = useTheme();

  return useMemo(() => {
    if ((forcedTheme ?? resolvedTheme) === "light") {
      return createTheme({
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
            'Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
        },
        styles: [
          { tag: [t.propertyName], color: "#4078F2" },
          { tag: [t.bool, t.null], color: "#696C77" },
          { tag: [t.number], color: "#FF0080" },
          { tag: [t.string], color: "#50A14F" },
          { tag: [t.separator], color: "#383A42" },
          { tag: [t.squareBracket], color: "#383A42" },
          { tag: [t.brace], color: "#A626A4" },
        ],
      });
    } else {
      return createTheme({
        theme: "dark",
        settings: {
          background: "var(--background)",
          foreground: "#9cdcfe",
          caret: "#c6c6c6",
          selection: "#6199ff2f",
          selectionMatch: "#72a1ff59",
          lineHighlight: "#ffffff0f",
          gutterBackground: "var(--background)",
          gutterForeground: "#838383",
          gutterActiveForeground: "#fff",
          fontFamily:
            'Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
        },
        styles: [
          { tag: [t.propertyName], color: "#4078F2" },
          { tag: [t.bool, t.null], color: "#696C77" },
          { tag: [t.number], color: "#f39c12" },
          { tag: [t.string], color: "#50A14F" },
          { tag: [t.separator], color: "#383A42" },
          { tag: [t.squareBracket], color: "#383A42" },
          { tag: [t.brace], color: "#A626A4" },
        ],
      });
    }
  }, [resolvedTheme, forcedTheme]);
}

const JsonEditor = forwardRef<ReactCodeMirrorRef, JsonEditorProps>(
  function SqlEditor({ value, onChange, readOnly }: JsonEditorProps, ref) {
    const theme = useJsonTheme();

    return (
      <CodeMirror
        ref={ref}
        autoFocus
        readOnly={readOnly}
        basicSetup={{
          drawSelection: false,
          lineNumbers: false,
        }}
        theme={theme}
        value={value}
        height="100%"
        onChange={onChange}
        style={{
          fontSize: 20,
          height: "100%",
        }}
        extensions={[json(), indentationMarkers()]}
      />
    );
  }
);

export default JsonEditor;
