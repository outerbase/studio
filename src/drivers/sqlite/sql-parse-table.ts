import type {
  DatabaseColumnConflict,
  DatabaseTableColumn,
  DatabaseTableColumnConstraint,
  DatabaseTableFts5,
  DatabaseTableSchema,
  SqlOrder,
} from "@/drivers/base-driver";
import { Token, tokenizeSql } from "@outerbase/sdk-transform";
import { unescapeIdentity } from "./sql-helper";

// This class represents a new cursor implementation for SQL parsing that operates on an array of strings
// rather than an Abstract Syntax Tree (AST). This approach is designed to reduce dependency on
// code-mirror's AST which may be subject to change, providing more stability for our parsing logic.
export class CursorV2 {
  private ptr: number = 0;

  constructor(private tokens: Token[]) {
    // Trim whitespace tokens from the beginning and end
    while (this.tokens.length > 0 && this.tokens[0].type === "WHITESPACE") {
      this.tokens.shift();
    }

    while (
      this.tokens.length > 0 &&
      this.tokens[this.tokens.length - 1].type === "WHITESPACE"
    ) {
      this.tokens.pop();
    }

    this.tokens = tokens;
  }

  getPointer() {
    return this.ptr;
  }

  toStringRange(start: number, end: number) {
    return this.tokens
      .slice(start, end)
      .map((t) => t.value)
      .join("");
  }

  read(): string {
    if (this.end()) return "";
    return this.tokens[this.ptr].value;
  }

  consumeBlock(): string {
    if (this.match("(")) {
      return this.consumeParen().toString();
    } else {
      return this.consume();
    }
  }

  currentType() {
    return this.tokens[this.ptr].type;
  }

  consumeParen(): CursorV2 {
    if (this.read() !== "(") throw new Error("Expecting (");

    const start = this.ptr + 1;
    let counter = 1;

    // Find the matching closing paren
    while (counter > 0) {
      if (!this.next()) throw new Error("Expecting closing paren");
      if (this.read() === "(") counter++;
      if (this.read() === ")") counter--;
    }

    const newCursor = new CursorV2(this.tokens.slice(start, this.ptr));
    this.next();

    return newCursor;
  }

  consume() {
    const value = this.read();
    this.next();
    return value;
  }

  consumeIdentifier() {
    const value = unescapeIdentity(this.read());
    this.next();
    return value;
  }

  expectToken(value: string) {
    if (!this.match(value)) throw new Error(`Expecting ${value}`);
    this.next();
  }

  expectTokenOptional(value: string) {
    if (this.match(value)) this.next();
  }

  expectTokensOptional(values: string[]) {
    if (values.length === 0) return;
    if (this.read() === values[0]) {
      this.next();
      for (const v of values.slice(1)) {
        this.expectToken(v);
      }
    }
  }

  expectTokens(values: string[]) {
    for (const v of values) {
      this.expectToken(v);
    }
  }

  /**
   * Next will skip to valid non-whitespace token
   * @returns true if there is a next token, false otherwise
   */
  next() {
    for (this.ptr = this.ptr + 1; this.ptr < this.tokens.length; this.ptr++) {
      if (this.currentType() !== "WHITESPACE") {
        return true;
      }
    }

    return false;
  }

  match(value: string) {
    if (this.end()) return false;
    return this.read().toLowerCase() === value.toLowerCase();
  }

  matchTokens(values: string[]) {
    return values.some((v) => this.read().toLowerCase() === v.toLowerCase());
  }

  end() {
    return this.ptr >= this.tokens.length;
  }

  toString() {
    return this.tokens.map((t) => t.value).join("");
  }

  toStringWithParen() {
    return "(" + this.toString() + ")";
  }
}

function parseColumnDef(
  schemaName: string,
  cursor: CursorV2
): DatabaseTableColumn | null {
  const columnName = cursor.consumeIdentifier();
  if (!columnName) return null;

  let dataType = cursor.read();
  cursor.next();

  // Handle case such as VARCHAR(255) where we need to read
  // something inside the parens
  if (cursor.match("(")) {
    dataType += cursor.consumeParen().toStringWithParen();
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
  cursor: CursorV2
): DatabaseColumnConflict | undefined {
  if (!cursor.match("ON")) return;
  cursor.next();

  if (!cursor.match("CONFLICT")) return;
  cursor.next();

  if (!cursor.end()) {
    const conflict = cursor.read().toUpperCase();
    cursor.next();
    return conflict as DatabaseColumnConflict;
  }

  return;
}

export function parseColumnList(columnPtr: CursorV2) {
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
  cursor: CursorV2
): DatabaseTableColumnConstraint | undefined {
  if (cursor.match("CONSTRAINT")) {
    cursor.next();
    const constraintName = cursor.consume();

    return {
      ...parseColumnConstraint(schemaName, cursor),
      name: constraintName,
    };
  } else if (cursor.match("PRIMARY")) {
    let primaryKeyOrder: SqlOrder | undefined;
    let primaryColumns: string[] | undefined;
    let autoIncrement = false;

    cursor.next();
    if (!cursor.match("KEY")) throw new Error("PRIMARY must follow by KEY");

    cursor.next();

    if (cursor.match("(")) {
      primaryColumns = parseColumnList(cursor.consumeParen());
    }

    if (cursor.match("ASC")) {
      primaryKeyOrder = "ASC";
      cursor.next();
    } else if (cursor.match("DESC")) {
      primaryKeyOrder = "DESC";
      cursor.next();
    }

    const conflict = parseConstraintConflict(cursor);

    if (cursor.match("AUTOINCREMENT")) {
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
  } else if (cursor.match("NOT")) {
    cursor.next();
    if (!cursor.match("NULL")) throw new Error("NOT should follow by NULL");
    cursor.next();

    const conflict = parseConstraintConflict(cursor);
    return {
      notNull: true,
      notNullConflict: conflict,
      ...parseColumnConstraint(schemaName, cursor),
    };
  } else if (cursor.match("UNIQUE")) {
    let uniqueColumns: string[] | undefined;

    cursor.next();

    if (cursor.read() === "(") {
      uniqueColumns = parseColumnList(cursor.consumeParen());
    }

    const conflict = parseConstraintConflict(cursor);

    return {
      unique: true,
      uniqueConflict: conflict,
      uniqueColumns,
      ...parseColumnConstraint(schemaName, cursor),
    };
  } else if (cursor.match("DEFAULT")) {
    let defaultValue: unknown;
    let defaultExpression: string | undefined;

    cursor.next();

    if (cursor.currentType() === "STRING") {
      defaultValue = cursor.read().slice(1, -1);
      cursor.next();
    } else if (cursor.currentType() === "OPERATOR") {
      if (cursor.match("+")) {
        cursor.next();
        defaultValue = Number(cursor.read());
        cursor.next();
      } else if (cursor.match("-")) {
        cursor.next();
        defaultValue = -Number(cursor.read());
        cursor.next();
      }
    } else if (cursor.currentType() === "NUMBER") {
      defaultValue = Number(cursor.read());
      cursor.next();
    } else if (cursor.match("(")) {
      defaultExpression = cursor.consumeParen().toString();
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
  } else if (cursor.match("CHECK")) {
    cursor.next();

    const expr = cursor.read();
    cursor.next();

    return {
      checkExpression: expr,
      ...parseColumnConstraint(schemaName, cursor),
    };
  } else if (cursor.match("COLLATE")) {
    cursor.next();

    const collationName = cursor.read();
    cursor.next();

    return {
      collate: collationName,
      ...parseColumnConstraint(schemaName, cursor),
    };
  } else if (cursor.match("FOREIGN")) {
    cursor.next();

    if (!cursor.match("KEY")) throw new Error("FOREIGN should follow by KEY");
    cursor.next();

    const parens = cursor.consumeParen();
    const columns = parseColumnList(parens);

    const refConstraint = parseColumnConstraint(schemaName, cursor);

    return {
      foreignKey: {
        foreignSchemaName: schemaName,
        foreignTableName: refConstraint?.foreignKey?.foreignTableName ?? "",
        foreignColumns: refConstraint?.foreignKey?.foreignColumns ?? [],
        columns,
      },
    };
  } else if (cursor.match("REFERENCES")) {
    cursor.next();
    const foreignTableName = cursor.consumeIdentifier();
    let foreignColumns: string[] = [];

    // Trying to find the parens by skipping all other rule
    // We may visit more rule in the future, but at the moment
    // it is too complex to handle all the rules.
    // We will just grab foreign key column first
    while (!cursor.end() && !cursor.match("(") && !cursor.match(",")) {
      cursor.next();
    }

    if (cursor.match("(")) {
      foreignColumns = parseColumnList(cursor.consumeParen());
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
    const expr = cursor.consumeBlock();

    cursor.next();
    const virtualColumnType = cursor.match("STORED") ? "STORED" : "VIRTUAL";

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
  cursor: CursorV2
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
      cursor.matchTokens([
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

  // console.log(columns, constraints);

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

function parseFTS5(cursor: CursorV2): DatabaseTableFts5 {
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

function parseTableOption(cursor: CursorV2):
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
  const cursor = new CursorV2(tokenizeSql(sql, "sqlite"));

  cursor.expectToken("CREATE");
  cursor.expectTokenOptional("TEMP");
  cursor.expectTokenOptional("TEMPORARY");
  cursor.expectTokenOptional("VIRTUAL");
  cursor.expectToken("TABLE");
  cursor.expectTokensOptional(["IF", "NOT", "EXIST"]);

  const tableName = cursor.consumeIdentifier();

  // Check for FTS5
  let fts5: DatabaseTableFts5 | undefined;

  if (cursor.match("USING")) {
    cursor.next();
    if (cursor.match("FTS5")) {
      cursor.next();
      fts5 = parseFTS5(cursor.consumeParen());
    }
  }

  const defs = cursor.match("(")
    ? parseTableDefinition(schemaName, cursor.consumeParen())
    : { columns: [], constraints: [] };

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
