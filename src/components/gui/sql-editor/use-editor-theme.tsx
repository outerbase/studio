import { tags as t } from "@lezer/highlight";
import { createTheme } from "@uiw/codemirror-themes";
import { useTheme } from "next-themes";
import { useMemo } from "react";

export default function useCodeEditorTheme({
  fontSize = 0.875,
}: {
  fontSize?: number;
}) {
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
          lineHighlight: "var(--accent)",
          fontSize: fontSize + "rem",
          fontFamily:
            'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
        },
        styles: [
          { tag: [t.meta, t.comment], color: "#804000" },
          { tag: [t.keyword, t.strong, t.standard(t.name)], color: "#0000FF" },
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
    } else {
      return createTheme({
        theme: "dark",
        settings: {
          background: "var(--background)",
          foreground: "#9cdcfe",
          caret: "#c6c6c6",
          selection: "#6199ff2f",
          selectionMatch: "#72a1ff59",
          lineHighlight: "var(--accent)",
          gutterBackground: "var(--background)",
          gutterForeground: "#838383",
          gutterActiveForeground: "#fff",
          fontSize: fontSize + "rem",
          fontFamily:
            'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
        },
        styles: [
          { tag: [t.number], color: "#fbc531" },
          { tag: [t.keyword, t.strong, t.standard(t.name)], color: "#3498db" },
          { tag: t.comment, color: "#27ae60" },
          { tag: t.definition(t.typeName), color: "#27ae60" },
          { tag: t.typeName, color: "#194a7b" },
          { tag: t.tagName, color: "#008a02" },
          { tag: t.variableName, color: "#1a00db" },
          { tag: t.string, color: "#e67e22" },
        ],
      });
    }
  }, [resolvedTheme, forcedTheme, fontSize]);
}
