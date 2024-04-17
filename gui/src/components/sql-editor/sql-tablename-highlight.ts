import {
  EditorView,
  ViewPlugin,
  Decoration,
  DecorationSet,
  ViewUpdate,
} from "@codemirror/view";
import { Range } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";

const underlineMark = Decoration.mark({ class: "cm-table-name" });

export default function createSQLTableNameHighlightPlugin(
  tableNameList: string[]
) {
  const tableNameSet = new Set(
    tableNameList.map((table) => table.toLowerCase())
  );

  function highlightTableName(view: EditorView) {
    const decorationList: Range<Decoration>[] = [];

    for (const { from, to } of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from,
        to,
        enter: (node) => {
          if (node.name == "Identifier") {
            const word = view.state.doc
              .sliceString(node.from, node.to)
              .toLowerCase();

            const lastChar = node.node.prevSibling
              ? view.state.doc
                  .sliceString(
                    node.node.prevSibling.from,
                    node.node.prevSibling.to
                  )
                  .toLowerCase()
              : "";

            if (tableNameSet.has(word) && lastChar !== ".") {
              decorationList.push(underlineMark.range(node.from, node.to));
            }
          }
        },
      });
    }

    return Decoration.set(decorationList);
  }

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = highlightTableName(view);
      }

      update(update: ViewUpdate) {
        this.decorations = highlightTableName(update.view);
      }
    },
    { decorations: (v) => v.decorations }
  );
}
