import { SQLite } from "@codemirror/lang-sql";
import { Cursor, parseColumnList } from "./sql-parse-table";

type TriggerWhen = "BEFORE" | "AFTER" | "INSTEAD_OF";

type TriggerOperation = "INSERT" | "UPDATE" | "DELETE";

export interface DatabaseTriggerSchema {
  name: string;
  operation: TriggerOperation;
  when: TriggerWhen;
  tableName: string;
  columnNames?: string[];
  whenExpression: string;
  statement: string;
}

export function parseCreateTriggerScript(sql: string): DatabaseTriggerSchema {
  const tree = SQLite.language.parser.parse(sql);
  const ptr = tree.cursor();
  ptr.firstChild();
  ptr.firstChild();
  const cursor = new Cursor(ptr, sql);
  cursor.expectKeyword("CREATE");
  cursor.expectKeywordOptional("TEMP");
  cursor.expectKeywordOptional("TEMPORARY");
  cursor.expectKeyword("TRIGGER");
  cursor.expectKeywordsOptional(["IF", "NOT", "EXIST"]);
  const name = cursor.consumeIdentifier();

  let when: TriggerWhen = "BEFORE";

  if (cursor.matchKeyword("BEFORE")) {
    cursor.next();
  } else if (cursor.matchKeyword("AFTER")) {
    when = "AFTER";
    cursor.next();
  } else if (cursor.matchKeywords(["INSTEAD", "OF"])) {
    when = "INSTEAD_OF";
    cursor.next();
    cursor.next();
  }

  let operation: TriggerOperation = "INSERT";
  let columnNames;

  if (cursor.matchKeyword("DELETE")) {
    operation = "DELETE";
    cursor.next();
  } else if (cursor.matchKeyword("INSERT")) {
    operation = "INSERT";
    cursor.next();
  } else if (cursor.matchKeyword("UPDATE")) {
    operation = "UPDATE";
    cursor.next();
    if (cursor.matchKeyword("OF")) {
      cursor.next();
      columnNames = parseColumnList(cursor);
    }
  }

  // console.log(cursor.read());
  cursor.expectKeyword("ON");
  const tableName = cursor.consumeIdentifier();
  cursor.expectKeywordsOptional(["FOR", "EACH", "ROW"]);

  let whenExpression = "";
  const fromExpression = cursor.node()?.from;
  let toExpression;

  if (cursor.matchKeyword("WHEN")) {
    // Loop till the end or meet the BEGIN
    cursor.next();

    while (!cursor.end()) {
      toExpression = cursor.node()?.to;
      if (cursor.matchKeyword("BEGIN")) break;
      // whenExpressionArray.push(cursor.read());
      cursor.next();
    }
  }

  if (fromExpression) {
    whenExpression = sql.substring(fromExpression, toExpression);
  }

  cursor.expectKeyword("BEGIN");

  let statement = "";
  const fromStatement = cursor.node()?.from;
  let toStatement;

  while (!cursor.end()) {
    toStatement = cursor.node()?.to;
    if (cursor.matchKeyword(";")) {
      break;
    }
    cursor.next();
  }

  if (fromStatement) {
    statement = sql.substring(fromStatement, toStatement);
  }

  return {
    name,
    operation,
    when,
    tableName,
    columnNames,
    whenExpression,
    statement,
  };
}
