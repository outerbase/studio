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

function checkRequireEndStatement(statement: string) {
  const prefixList = ["CREATE TRIGGER", "ALTER TRIGGER"];

  for (const prefix of prefixList) {
    if (statement.substring(0, prefix.length).toUpperCase() === prefix)
      return true;
  }

  return false;
}

function resolveToNearestStatement(
  state: EditorState,
  node: SyntaxNode,
  cursor: number
) {
  const statements = node.getChildren("Statement");

  if (statements.length === 0) return [];

  let nodes: SyntaxNode[] = [];
  let needEndStatement = false;
  let i = 0;

  for (; i < statements.length; i++) {
    const statement = statements[i];

    // Check if it is required end statement
    const nodeString = state.doc.sliceString(statement.from, statement.to);
    needEndStatement = needEndStatement || checkRequireEndStatement(nodeString);

    if (needEndStatement) {
      nodes.push(statement);
    }

    if (statement.to > cursor) {
      break;
    }

    if (nodeString.toUpperCase() === "END;") {
      nodes = [];
      needEndStatement = false;
    }
  }

  console.log(needEndStatement, "sss");
  if (needEndStatement) {
    // Loop till we find END statement
    for (; i < statements.length; i++) {
      const statement = statements[i];
      const nodeString = state.doc.sliceString(statement.from, statement.to);
      nodes.push(statement);

      if (nodeString.toUpperCase() === "END;") {
        break;
      }
    }
  } else {
    nodes.push(statements[Math.min(i, statements.length - 1)]);
  }

  return nodes;
}

function getDecorationFromState(state: EditorState) {
  const tree = syntaxTree(state);
  const node = resolveToNearestStatement(
    state,
    tree.topNode,
    state.selection.main.from
  );

  console.log(node);
  if (node.length === 0) return Decoration.none;

  // Get the line of the node
  const fromLineNumber = state.doc.lineAt(node[0].from).number;
  const toLineNumber = state.doc.lineAt(node[node.length - 1].to).number;

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
