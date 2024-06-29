import { Tooltip, showTooltip, EditorView } from "@codemirror/view";
import { StateField, EditorState } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";

export type TooltipDirectionary = Record<
  string,
  { syntax: string; description: string }
>;

function getCursorTooltips(
  state: EditorState,
  dict: TooltipDirectionary
): readonly Tooltip[] {
  const tree = syntaxTree(state);
  const pos = state.selection.main.head;
  const node = tree.resolveInner(state.selection.main.head, -1);

  const parent = node.parent;
  if (!parent) return [];
  if (parent.type.name !== "Parens") return [];

  if (!parent.prevSibling) return [];
  if (!["Keyword", "Type"].includes(parent.prevSibling.type.name)) return [];

  const keywordString = state.doc
    .slice(parent.prevSibling.from, parent.prevSibling.to)
    .toString()
    .toLowerCase();

  const dictItem = dict[keywordString];

  if (dictItem) {
    return [
      {
        pos: pos,
        above: true,
        arrow: true,
        create: () => {
          const dom = document.createElement("div");
          dom.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            const link = target.closest("a");
            if (link) {
              e.preventDefault();
            }
          });
          dom.className = "cm-tooltip-cursor";
          dom.innerHTML = `
            <div style="max-width:700px;">
              <p><strong>${dictItem.syntax}</strong></p>
              <div class="code-tooltip">${dictItem.description}</div>
            </div>
            `;
          return { dom };
        },
      },
    ];
  }

  return [];
}

const functionTooltipField = (dict: TooltipDirectionary) => {
  return StateField.define<readonly Tooltip[]>({
    create(state) {
      return getCursorTooltips(state, dict);
    },

    update(tooltips, tr) {
      if (!tr.docChanged && !tr.selection) return tooltips;
      return getCursorTooltips(tr.state, dict);
    },

    provide: (f) => showTooltip.computeN([f], (state) => state.field(f)),
  });
};

const functionTooltipBaseTheme = EditorView.baseTheme({
  ".cm-tooltip.cm-tooltip-cursor": {
    backgroundColor: "#66b",
    color: "white",
    border: "none",
    padding: "2px 7px",
    borderRadius: "4px",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#66b",
    },
    "& .cm-tooltip-arrow:after": {
      borderTopColor: "transparent",
    },
  },
  ".code-tooltip a": {
    color: "white",
    textDecoration: "underline",
  },
  ".code-tooltip a:hover": {
    color: "white",
    textDecoration: "none",
  },
});

export function functionTooltip(dict: TooltipDirectionary) {
  return [functionTooltipField(dict), functionTooltipBaseTheme];
}
