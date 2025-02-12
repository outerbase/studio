import { syntaxTree } from "@codemirror/language";
import { SyntaxNode } from "@lezer/common";
import {
  Decoration,
  EditorState,
  EditorView,
  Range,
  StateField,
} from "@uiw/react-codemirror";

const statementLineHighlight = Decoration.line({
  class: "cm-highlight-statement",
});

export interface StatementSegment {
  from: number;
  to: number;
  text: string;
}

function toNodeString(state: EditorState, node: SyntaxNode) {
  return state.doc.sliceString(node.from, node.to);
}

function isRequireEndStatement(state: EditorState, node: SyntaxNode): number {
  const ptr = node.firstChild;
  if (!ptr) return 0;

  // Majority of the query will fall in SELECT, INSERT, UPDATE, DELETE
  const firstKeyword = toNodeString(state, ptr).toLowerCase();
  if (firstKeyword === "select") return 0;
  if (firstKeyword === "insert") return 0;
  if (firstKeyword === "update") return 0;
  if (firstKeyword === "delete") return 0;

  const keywords = node.getChildren("Keyword");
  if (keywords.length === 0) return 0;

  return keywords.filter(
    (k) => toNodeString(state, k).toLowerCase() === "begin"
  ).length;
}

function isEndStatement(state: EditorState, node: SyntaxNode) {
  let ptr = node.firstChild;
  if (!ptr) return false;
  if (toNodeString(state, ptr).toLowerCase() !== "end") return false;

  ptr = ptr.nextSibling;
  if (!ptr) return false;
  if (toNodeString(state, ptr) !== ";") return false;

  return true;
}

export function splitSqlQuery(
  state: EditorState,
  generateText: boolean = true
): StatementSegment[] {
  const topNode = syntaxTree(state).topNode;

  // Get all the statements
  let needEndStatementCounter = 0;
  const statements = topNode.getChildren("Statement");

  if (statements.length === 0) return [];

  const statementGroups: SyntaxNode[][] = [];
  let accumulateNodes: SyntaxNode[] = [];
  let i = 0;

  for (; i < statements.length; i++) {
    const statement = statements[i];
    needEndStatementCounter += isRequireEndStatement(state, statement);

    if (needEndStatementCounter) {
      accumulateNodes.push(statement);
    } else {
      statementGroups.push([statement]);
    }

    if (needEndStatementCounter && isEndStatement(state, statement)) {
      needEndStatementCounter--;
      if (needEndStatementCounter === 0) {
        statementGroups.push(accumulateNodes);
        accumulateNodes = [];
      }
    }
  }

  if (accumulateNodes.length > 0) {
    statementGroups.push(accumulateNodes);
  }

  return statementGroups.map((r) => ({
    from: r[0].from,
    to: r[r.length - 1].to,
    text: generateText
      ? state.doc.sliceString(r[0].from, r[r.length - 1].to)
      : "",
  }));
}

export function resolveToNearestStatement(
  state: EditorState,
  position?: number
): { from: number; to: number } | null {
  // Breakdown and grouping the statement
  const cursor = position ?? state.selection.main.from;
  const statements = splitSqlQuery(state, false);

  if (statements.length === 0) return null;

  // Check if our current cursor is within any statement
  let i = 0;
  for (; i < statements.length; i++) {
    const statement = statements[i];
    if (cursor < statement.from) break;
    if (cursor > statement.to) continue;
    if (cursor >= statement.from && cursor <= statement.to) return statement;
  }

  if (i === 0) return statements[0];
  if (i === statements.length) return statements[i - 1];

  const cursorLine = state.doc.lineAt(cursor).number;
  const topLine = state.doc.lineAt(statements[i - 1].to).number;
  const bottomLine = state.doc.lineAt(statements[i].from).number;

  if (cursorLine - topLine >= bottomLine - cursorLine) {
    return statements[i];
  } else {
    return statements[i - 1];
  }
}
function getDecorationFromState(state: EditorState) {
  const statement = resolveToNearestStatement(state);

  if (!statement) return Decoration.none;

  // Get the line of the node
  const fromLineNumber = state.doc.lineAt(statement.from).number;
  const toLineNumber = state.doc.lineAt(statement.to).number;

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
