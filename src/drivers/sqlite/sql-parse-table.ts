import type {
  DatabaseColumnConflict,
  DatabaseTableColumn,
  DatabaseTableColumnConstraint,
  DatabaseTableFts5,
  DatabaseTableSchema,
  SqlOrder,
} from "@/drivers/base-driver";
import { sqliteDialect } from "@/drivers/sqlite/sqlite-dialect";
import type { SyntaxNode, TreeCursor } from "@lezer/common";
import { unescapeIdentity } from "./sql-helper";

export class Cursor {
  protected ptr: SyntaxNode | null;
  protected sql = "";

  constructor(ptr: TreeCursor, sql: string) {
    this.ptr = ptr.node;
    this.sql = sql;
  }

  expectKeyword(keyword: string) {
    const errorMessage = `Expect ${keyword} keywords, but not found`;

    if (!this.ptr) throw new Error(errorMessage);
    if (!this.matchKeyword(keyword)) throw new Error(errorMessage);

    this.ptr = this.ptr.nextSibling;
  }

  expectKeywordOptional(keyword: string) {
    if (this.ptr) {
      if (this.matchKeyword(keyword)) {
        this.next();
      }
    }
  }

  expectKeywordsOptional(keywords: string[]) {
    if (keywords.length === 0) return;
    if (this.matchKeyword(keywords[0] ?? "")) {
      this.next();
      for (const k of keywords.slice(1)) {
        this.expectKeyword(k);
      }
    }
  }

  consumeIdentifier() {
    if (this.ptr) {
      const id = unescapeIdentity(this.read());
      this.next();
      return id;
    }
    return "";
  }

  readKeyword(): string {
    if (this.ptr && this.ptr.type.name === "Keyword") {
      const keyword = this.read();
      this.next();
      return keyword;
    }
    return "";
  }

  next() {
    this.ptr = this.ptr?.nextSibling ?? null;
  }

  matchKeyword(keyword: string) {
    if (this.ptr && this.ptr.type.name !== "Keyword") return false;
    return this.read().toUpperCase() === keyword.toUpperCase();
  }

  matchKeywords(keywords: string[]) {
    if (this.ptr && this.ptr.type.name !== "Keyword") return false;
    const currentValue = this.read().toUpperCase();
    return keywords.some((keyword) => keyword.toUpperCase() === currentValue);
  }

  match(keyword: string) {
    if (!this.ptr) return false;
    return this.read().toUpperCase() === keyword.toUpperCase();
  }

  read(): string {
    if (this.ptr?.node) {
      return this.sql.substring(this.ptr.node.from, this.ptr.node.to);
    }
    return "";
  }

  node(): SyntaxNode | undefined {
    return this.ptr?.node;
  }

  type(): string | undefined {
    return this.ptr?.type.name;
  }

  enterParens(): Cursor | null {
    if (this.ptr?.firstChild) {
      if (this.ptr.firstChild.name !== "(") return null;
      if (!this.ptr.firstChild.nextSibling) return null;
      return new Cursor(this.ptr.firstChild.nextSibling.cursor(), this.sql);
    }

    return null;
  }

  end() {
    return this.ptr === null;
  }
}

export function buildSyntaxCursor(sql: string): Cursor {
  const r = sqliteDialect.language.parser.parse(sql).cursor();
  r.firstChild();
  r.firstChild();

  return new Cursor(r, sql);
}

function parseColumnDef(
  schemaName: string,
  cursor: Cursor
): DatabaseTableColumn | null {
  const columnName = cursor.consumeIdentifier();
  if (!columnName) return null;

  let dataType = cursor.read();
  cursor.next();

  // Handle case such as VARCHAR(255) where we need to read
  // something inside the parens
  if (cursor.type() === "Parens") {
    dataType += cursor.read();
    cursor.next();
  }

  const constraint = parseColumnConstraint(schemaName, cursor);

  return {
    name: columnName,
    pk: constraint?.primaryKey,
    constraint,
    type: dataType,
  };
}

function parseConstraintConflict(
  cursor: Cursor
): DatabaseColumnConflict | undefined {
  if (!cursor.matchKeyword("ON")) return;
  cursor.next();

  if (!cursor.matchKeyword("CONFLICT")) return;
  cursor.next();

  if (!cursor.end()) {
    const conflict = cursor.read().toUpperCase();
    cursor.next();
    return conflict as DatabaseColumnConflict;
  }

  return;
}

export function parseColumnList(columnPtr: Cursor) {
  const columns: string[] = [];

  while (!columnPtr.end()) {
    columns.push(columnPtr.consumeIdentifier());

    if (!columnPtr.match(",")) break;
    columnPtr.next();
  }

  return columns;
}

export function parseColumnConstraint(
  schemaName: string,
  cursor: Cursor
): DatabaseTableColumnConstraint | undefined {
  if (cursor.matchKeyword("CONSTRAINT")) {
    cursor.next();
    const constraintName = cursor.consumeIdentifier();

    return {
      ...parseColumnConstraint(schemaName, cursor),
      name: constraintName,
    };
  } else if (cursor.matchKeyword("PRIMARY")) {
    let primaryKeyOrder: SqlOrder | undefined;
    let primaryColumns: string[] | undefined;
    let autoIncrement = false;

    cursor.next();
    if (!cursor.matchKeyword("KEY"))
      throw new Error("PRIMARY must follow by KEY");

    cursor.next();

    const parens = cursor.enterParens();
    if (parens) {
      primaryColumns = parseColumnList(parens);
      cursor.next();
    }

    if (cursor.matchKeyword("ASC")) {
      primaryKeyOrder = "ASC";
      cursor.next();
    } else if (cursor.matchKeyword("DESC")) {
      primaryKeyOrder = "DESC";
      cursor.next();
    }

    const conflict = parseConstraintConflict(cursor);

    if (cursor.matchKeyword("AUTOINCREMENT")) {
      autoIncrement = true;
      cursor.next();
    }

    return {
      primaryKey: true,
      primaryKeyOrder,
      primaryColumns,
      autoIncrement,
      primaryKeyConflict: conflict,
      ...parseColumnConstraint(schemaName, cursor),
    };
  } else if (cursor.matchKeyword("NOT")) {
    cursor.next();
    if (!cursor.match("NULL")) throw new Error("NOT should follow by NULL");
    cursor.next();

    const conflict = parseConstraintConflict(cursor);
    return {
      notNull: true,
      notNullConflict: conflict,
      ...parseColumnConstraint(schemaName, cursor),
    };
  } else if (cursor.matchKeyword("UNIQUE")) {
    let uniqueColumns: string[] | undefined;

    cursor.next();

    const parens = cursor.enterParens();
    if (parens) {
      uniqueColumns = parseColumnList(parens);
      cursor.next();
    }

    const conflict = parseConstraintConflict(cursor);

    return {
      unique: true,
      uniqueConflict: conflict,
      uniqueColumns,
      ...parseColumnConstraint(schemaName, cursor),
    };
  } else if (cursor.matchKeyword("DEFAULT")) {
    let defaultValue: unknown;
    let defaultExpression: string | undefined;

    cursor.next();

    if (cursor.type() === "String") {
      defaultValue = cursor.read().slice(1, -1);
      cursor.next();
    } else if (cursor.type() === "Operator") {
      if (cursor.match("+")) {
        cursor.next();
        defaultValue = Number(cursor.read());
        cursor.next();
      } else if (cursor.match("-")) {
        cursor.next();
        defaultValue = -Number(cursor.read());
        cursor.next();
      }
    } else if (cursor.type() === "Number") {
      defaultValue = Number(cursor.read());
      cursor.next();
    } else if (cursor.type() === "Parens") {
      defaultExpression = cursor.read();
      cursor.next();
    } else if (
      cursor.match("current_timestamp") ||
      cursor.match("current_time") ||
      cursor.match("current_date") ||
      cursor.match("true") ||
      cursor.match("false") ||
      cursor.match("null")
    ) {
      defaultExpression = cursor.read();
      cursor.next();
    }

    return {
      defaultValue,
      defaultExpression,
      ...parseColumnConstraint(schemaName, cursor),
    };
  } else if (cursor.matchKeyword("CHECK")) {
    cursor.next();

    const expr = cursor.read();
    cursor.next();

    return {
      checkExpression: expr,
      ...parseColumnConstraint(schemaName, cursor),
    };
  } else if (cursor.matchKeyword("COLLATE")) {
    cursor.next();

    const collationName = cursor.read();
    cursor.next();

    return {
      collate: collationName,
      ...parseColumnConstraint(schemaName, cursor),
    };
  } else if (cursor.matchKeyword("FOREIGN")) {
    cursor.next();

    if (!cursor.match("KEY")) throw new Error("FOREIGN should follow by KEY");
    cursor.next();

    const parens = cursor.enterParens();

    if (!parens) throw new Error("FOREIGN KEY should follow by column list");

    const columns = parseColumnList(parens);
    cursor.next();
    const refConstraint = parseColumnConstraint(schemaName, cursor);

    return {
      foreignKey: {
        foreignSchemaName: schemaName,
        foreignTableName: refConstraint?.foreignKey?.foreignTableName ?? "",
        foreignColumns: refConstraint?.foreignKey?.foreignColumns ?? [],
        columns,
      },
    };
  } else if (cursor.matchKeyword("REFERENCES")) {
    cursor.next();
    const foreignTableName = cursor.consumeIdentifier();
    let foreignColumns: string[] = [];

    // Trying to find the parens by skipping all other rule
    // We may visit more rule in the future, but at the moment
    // it is too complex to handle all the rules.
    // We will just grab foreign key column first
    while (!cursor.end() && cursor.type() !== "Parens" && !cursor.match(",")) {
      cursor.next();
    }

    const columnPtr = cursor.enterParens();

    if (columnPtr) {
      foreignColumns = parseColumnList(columnPtr);
    }

    return {
      foreignKey: {
        foreignSchemaName: schemaName,
        foreignTableName,
        foreignColumns,
      },
      ...parseColumnConstraint(schemaName, cursor),
    };
  } else if (cursor.match("GENERATED")) {
    cursor.next();
    if (!cursor.match("ALWAYS"))
      throw new Error("GENERATED should follow by ALWAYS");

    cursor.next();
    if (!cursor.match("AS"))
      throw new Error("GENERATED ALWAYS should follow by AS");

    cursor.next();
    const expr = cursor.read();

    cursor.next();
    const virtualColumnType = cursor.matchKeyword("STORED")
      ? "STORED"
      : "VIRTUAL";

    return {
      generatedType: virtualColumnType,
      generatedExpression: expr,
      ...parseColumnConstraint(schemaName, cursor),
    };
  }

  return undefined;
}

function parseTableDefinition(
  schemaName: string,
  cursor: Cursor
): {
  columns: DatabaseTableColumn[];
  constraints: DatabaseTableColumnConstraint[];
} {
  let moveNext = true;
  const columns: DatabaseTableColumn[] = [];
  const constraints: DatabaseTableColumnConstraint[] = [];

  while (moveNext) {
    moveNext = false;

    if (
      cursor.matchKeywords([
        "CONSTRAINT",
        "PRIMARY",
        "UNIQUE",
        "CHECK",
        "FOREIGN",
      ])
    ) {
      const constraint = parseColumnConstraint(schemaName, cursor);
      if (constraint) {
        constraints.push(constraint);
        moveNext = true;
      }
    } else {
      const column = parseColumnDef(schemaName, cursor);
      if (column) {
        columns.push(column);
        moveNext = true;
      }
    }

    while (cursor.read() !== "," && !cursor.end()) {
      cursor.next();
    }

    if (cursor.end()) break;
    cursor.next();
  }

  for (const constraint of constraints) {
    if (constraint.primaryKey && constraint.primaryColumns) {
      for (const pkColumn of constraint.primaryColumns) {
        const column = columns.find(
          (col) => pkColumn.toLowerCase() === col.name.toLowerCase()
        );

        if (column) {
          column.pk = true;
        }
      }
    }
  }

  for (const column of columns) {
    const fk = column.constraint?.foreignKey;
    if (fk?.foreignColumns && fk.foreignColumns.length === 0) {
      fk.foreignColumns = [column.name];
    }
  }

  return { columns, constraints };
}

function parseFTS5(cursor: Cursor | null): DatabaseTableFts5 {
  if (!cursor) return {};

  let content: string | undefined;
  let contentRowId: string | undefined;

  const ptr = cursor;
  while (!ptr.end()) {
    if (ptr.match("content")) {
      ptr.next();
      if (ptr.match("=")) {
        ptr.next();
        if (!ptr.end()) {
          content = unescapeIdentity(ptr.read());
          ptr.next();
        }
      }
    } else if (ptr.match("content_rowid")) {
      ptr.next();
      if (ptr.match("=")) {
        ptr.next();
        if (!ptr.end()) {
          contentRowId = unescapeIdentity(ptr.read());
          ptr.next();
        }
      }
    }

    ptr.next();
  }

  return {
    content,
    contentRowId,
  };
}

function parseTableOption(cursor: Cursor):
  | {
      strict?: boolean;
      withoutRowId?: boolean;
    }
  | undefined {
  if (cursor.match("WITHOUT")) {
    cursor.next();
    if (cursor.match("ROWID")) {
      cursor.next();
      if (cursor.match(",")) {
        cursor.next();
        return { withoutRowId: true, ...parseTableOption(cursor) };
      } else {
        return { withoutRowId: true };
      }
    }
  } else if (cursor.match("STRICT")) {
    cursor.next();
    if (cursor.match(",")) {
      cursor.next();
      return { strict: true, ...parseTableOption(cursor) };
    } else {
      return { strict: true };
    }
  }
}

// Our parser follows this spec
// https://www.sqlite.org/lang_createtable.html
export function parseCreateTableScript(
  schemaName: string,
  sql: string
): DatabaseTableSchema {
  const tree = sqliteDialect.language.parser.parse(sql);
  const ptr = tree.cursor();

  ptr.firstChild();
  ptr.firstChild();

  const cursor = new Cursor(ptr, sql);
  cursor.expectKeyword("CREATE");
  cursor.expectKeywordOptional("TEMP");
  cursor.expectKeywordOptional("TEMPORARY");
  cursor.expectKeywordOptional("VIRTUAL");
  cursor.expectKeyword("TABLE");
  cursor.expectKeywordsOptional(["IF", "NOT", "EXIST"]);
  const tableName = cursor.consumeIdentifier();

  // Check for FTS5
  let fts5: DatabaseTableFts5 | undefined;

  if (cursor.match("USING")) {
    cursor.next();
    if (cursor.match("FTS5")) {
      cursor.next();
      fts5 = parseFTS5(cursor.enterParens());
      cursor.next();
    }
  }

  const defCursor = cursor.enterParens();
  const defs = defCursor
    ? parseTableDefinition(schemaName, defCursor)
    : { columns: [], constraints: [] };

  cursor.next();
  // Parsing table options

  const pk = defs.columns.filter((col) => col.pk).map((col) => col.name);

  const autoIncrement = defs.columns.some(
    (col) => !!col.constraint?.autoIncrement
  );

  return {
    tableName,
    schemaName,
    ...defs,
    pk,
    autoIncrement,
    fts5,
    ...parseTableOption(cursor),
  };
}
