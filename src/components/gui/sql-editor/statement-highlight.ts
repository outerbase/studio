import {
  Decoration,
  EditorState,
  EditorView,
  StateField,
  Range,
} from "@uiw/react-codemirror";
import { syntaxTree } from "@codemirror/language";
import { SyntaxNode } from "@lezer/common";

const statementLineHighlight = Decoration.line({
  class: "cm-highlight-statement",
});

function resolveToNearestStatement(node: SyntaxNode, cursor: number) {
  const statements = node.getChildren("Statement");
  if (statements.length === 0) return null;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (statement.to < cursor) continue;
    return statement;
  }

  return statements[statements.length - 1];
}

function getDecorationFromState(state: EditorState) {
  const tree = syntaxTree(state);
  const node = resolveToNearestStatement(
    tree.topNode,
    state.selection.main.from
  );

  if (!node) return Decoration.none;

  // Get the line of the node
  const fromLineNumber = state.doc.lineAt(node.from).number;
  const toLineNumber = state.doc.lineAt(node.to).number;

  const d: Range<Decoration>[] = [];
  for (let i = fromLineNumber; i <= toLineNumber; i++) {
    d.push(statementLineHighlight.range(state.doc.line(i).from));
  }

  return Decoration.set(d);
}

const SqlStatementStateField = StateField.define({
  create(state) {
    return getDecorationFromState(state);
  },

  update(_, tr) {
    return getDecorationFromState(tr.state);
  },

  provide: (f) => EditorView.decorations.from(f),
});

const SqlStatementTheme = EditorView.baseTheme({
  ".cm-highlight-statement": {
    borderLeft: "3px solid #ff9ff3 !important",
  },
});

const SqlStatementHighlightPlugin = [SqlStatementStateField, SqlStatementTheme];

export default SqlStatementHighlightPlugin;
