import {
  DatabaseTriggerSchema,
  TriggerOperation,
  TriggerWhen,
} from "@/drivers/base-driver";
import { tokenizeSql } from "@outerbase/sdk-transform";
import { CursorV2, parseColumnList } from "./sql-parse-table";

export function parseCreateTriggerScript(
  schemaName: string,
  sql: string
): DatabaseTriggerSchema {
  const cursor = new CursorV2(tokenizeSql(sql, "sqlite"));

  cursor.expectToken("CREATE");
  cursor.expectTokenOptional("TEMP");
  cursor.expectTokenOptional("TEMPORARY");
  cursor.expectToken("TRIGGER");
  cursor.expectTokensOptional(["IF", "NOT", "EXIST"]);
  const name = cursor.consumeIdentifier();

  let when: TriggerWhen = "BEFORE";

  if (cursor.match("BEFORE")) {
    cursor.next();
  } else if (cursor.match("AFTER")) {
    when = "AFTER";
    cursor.next();
  } else if (cursor.match("INSTEAD")) {
    cursor.expectTokens(["INSTEAD", "OF"]);
    when = "INSTEAD_OF";
  }

  let operation: TriggerOperation = "INSERT";
  let columnNames;

  if (cursor.match("DELETE")) {
    operation = "DELETE";
    cursor.next();
  } else if (cursor.match("INSERT")) {
    operation = "INSERT";
    cursor.next();
  } else if (cursor.match("UPDATE")) {
    operation = "UPDATE";
    cursor.next();
    if (cursor.match("OF")) {
      cursor.next();
      columnNames = parseColumnList(cursor);
    }
  }

  cursor.expectToken("ON");
  const tableName = cursor.consumeIdentifier();
  cursor.expectTokensOptional(["FOR", "EACH", "ROW"]);

  let whenExpression = "";
  const fromExpression = cursor.getPointer();
  let toExpression;

  if (cursor.match("WHEN")) {
    // Loop till the end or meet the BEGIN
    cursor.next();

    while (!cursor.end()) {
      toExpression = cursor.getPointer();
      if (cursor.match("BEGIN")) break;
      cursor.next();
    }
  }

  if (fromExpression && toExpression) {
    whenExpression = cursor.toStringRange(fromExpression, toExpression);
  }

  cursor.expectToken("BEGIN");

  let statement = "";
  const fromStatement = cursor.getPointer();
  let toStatement;

  while (!cursor.end()) {
    toStatement = cursor.getPointer();
    if (cursor.match(";")) {
      cursor.next();
      if (cursor.match("END")) break;
    } else {
      cursor.next();
    }
  }

  if (fromStatement && toStatement) {
    statement = cursor.toStringRange(fromStatement, toStatement + 1);
  }

  return {
    name,
    operation,
    when,
    tableName,
    schemaName,
    columnNames,
    whenExpression,
    statement,
  };
}
