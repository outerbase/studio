import { sqliteDialect } from "@/drivers/sqlite/sqlite-dialect";
import { DatabaseViewSchema } from "../base-driver";
import { Cursor } from "./sql-parse-table";

export function parseCreateViewScript(
  schemaName: string,
  sql: string
): DatabaseViewSchema {
  const tree = sqliteDialect.language.parser.parse(sql);
  const ptr = tree.cursor();
  ptr.firstChild();
  ptr.firstChild();
  const cursor = new Cursor(ptr, sql);
  cursor.expectKeyword("CREATE");
  cursor.expectKeywordOptional("TEMP");
  cursor.expectKeywordOptional("TEMPORARY");
  cursor.expectKeyword("VIEW");
  cursor.expectKeywordsOptional(["IF", "NOT", "EXIST"]);
  const name = cursor.consumeIdentifier();

  cursor.expectKeyword("AS");

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
    schemaName,
    name,
    statement,
  };
}
