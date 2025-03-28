import { tokenizeSql } from "@outerbase/sdk-transform";
import { DatabaseViewSchema } from "../base-driver";
import { CursorV2 } from "./sql-parse-table";

export function parseCreateViewScript(
  schemaName: string,
  sql: string
): DatabaseViewSchema {
  const cursor = new CursorV2(tokenizeSql(sql, "sqlite"));

  cursor.expectToken("CREATE");
  cursor.expectTokenOptional("TEMP");
  cursor.expectTokenOptional("TEMPORARY");
  cursor.expectToken("VIEW");
  cursor.expectTokensOptional(["IF", "NOT", "EXIST"]);

  const name = cursor.consumeIdentifier();

  cursor.expectToken("AS");

  let statement = "";
  const fromStatement = cursor.getPointer();
  let toStatement;

  while (!cursor.end()) {
    toStatement = cursor.getPointer();

    if (cursor.match(";")) {
      break;
    }

    cursor.next();
  }

  if (fromStatement && toStatement) {
    statement = cursor.toStringRange(fromStatement, toStatement);
  }

  return {
    schemaName,
    name,
    statement,
  };
}
