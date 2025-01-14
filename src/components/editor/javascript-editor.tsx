import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { forwardRef, useMemo } from "react";
import { tags as t } from "@lezer/highlight";
import createTheme from "@uiw/codemirror-themes";
import { useTheme } from "@/context/theme-provider";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";

interface JsonEditorProps {
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

function useJavascriptTheme() {
  const { theme } = useTheme();

  return useMemo(() => {
    if (theme === "light") {
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
          {
            tag: [t.propertyName, t.function(t.variableName)],
            color: "#e67e22",
          },
          { tag: [t.keyword], color: "#0000FF" },
          { tag: [t.comment, t.blockComment], color: "#95a5a6" },
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
          { tag: [t.propertyName], color: "#9b59b6" },
          { tag: [t.bool, t.null], color: "#696C77" },
          { tag: [t.number], color: "#f39c12" },
          { tag: [t.string], color: "#50A14F" },
          { tag: [t.separator], color: "#383A42" },
          { tag: [t.squareBracket], color: "#383A42" },
          { tag: [t.brace], color: "#A626A4" },
        ],
      });
    }
  }, [theme]);
}

const JavascriptEditor = forwardRef<ReactCodeMirrorRef, JsonEditorProps>(
  function JavascriptEditor(
    { value, onChange, readOnly }: JsonEditorProps,
    ref
  ) {
    const theme = useJavascriptTheme();

    return (
      <CodeMirror
        className="border p-1 rounded"
        ref={ref}
        autoFocus
        readOnly={readOnly}
        basicSetup={{
          drawSelection: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          foldGutter: false,
        }}
        theme={theme}
        value={value}
        height="100%"
        onChange={onChange}
        style={{
          fontSize: 20,
          height: "100%",
        }}
        extensions={[javascript(), indentationMarkers()]}
      />
    );
  }
);

export default JavascriptEditor;
