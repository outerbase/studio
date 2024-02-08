import {
  DatabaseColumnConflict,
  DatabaseTableColumn,
  DatabaseTableColumnConstraint,
  DatabaseTableSchema,
} from "@/drivers/DatabaseDriver";
import { SQLite } from "@codemirror/lang-sql";
import { SyntaxNode, Tree, TreeCursor } from "@lezer/common";

class Cursor {
  protected ptr: SyntaxNode | null;
  protected sql: string = "";

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
    if (this.matchKeyword(keywords[0])) {
      this.next();
      for (let k of keywords.slice(1)) {
        this.expectKeyword(k);
      }
    }
  }

  consumeIdentifier() {
    if (this.ptr) {
      const id = this.read();
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

  type(): string | undefined {
    return this.ptr?.type.name;
  }

  enterParens(): Cursor | null {
    if (this.ptr && this.ptr.firstChild) {
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
  const r = SQLite.language.parser.parse(sql).cursor();
  r.firstChild();
  r.firstChild();

  return new Cursor(r, sql);
}

function parseColumnDef(cursor: Cursor): DatabaseTableColumn | null {
  const columnName = cursor.consumeIdentifier();
  if (!columnName) return null;

  const dataType = cursor.readKeyword();

  return {
    name: columnName,
    pk: false,
    nullable: false,
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
}

export function parseColumnConstraint(
  cursor: Cursor
): DatabaseTableColumnConstraint | undefined {
  if (cursor.matchKeyword("CONSTRAINT")) {
    cursor.next();
    const constraintName = cursor.consumeIdentifier();

    return {
      ...parseColumnConstraint(cursor),
      name: constraintName,
    };
  } else if (cursor.matchKeyword("PRIMARY")) {
    let primaryKeyOrder: "ASC" | "DESC" | undefined;
    let autoIncrement = false;

    cursor.next();
    if (!cursor.matchKeyword("KEY"))
      throw new Error("PRIMARY must follow by KEY");

    cursor.next();

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
      name: "",
      primaryKey: true,
      primaryKeyOrder,
      autoIncrement,
      primaryKeyConflict: conflict,
      ...parseColumnConstraint(cursor),
    };
  } else if (cursor.matchKeyword("NOT")) {
    cursor.next();
    if (!cursor.match("NULL")) throw new Error("NOT should follow by NULL");
    cursor.next();

    const conflict = parseConstraintConflict(cursor);
    return {
      name: "",
      notNull: true,
      notNullConflict: conflict,
      ...parseColumnConstraint(cursor),
    };
  } else if (cursor.matchKeyword("UNIQUE")) {
    cursor.next();
    const conflict = parseConstraintConflict(cursor);
    return {
      name: "",
      unique: true,
      uniqueConflict: conflict,
      ...parseColumnConstraint(cursor),
    };
  } else if (cursor.matchKeyword("DEFAULT")) {
    let defaultValue: unknown | undefined;
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
    }

    return {
      name: "",
      defaultValue,
      defaultExpression,
      ...parseColumnConstraint(cursor),
    };
  } else if (cursor.matchKeyword("CHECK")) {
  } else if (cursor.matchKeyword("COLLATE")) {
  } else if (cursor.matchKeyword("REFERENCES")) {
  } else if (cursor.matchKeyword("GENERATED")) {
  }

  return undefined;
}

function parseTableConstraint(cursor: Cursor) {
  return null;
}

function parseTableDefinition(cursor: Cursor): {
  columns: DatabaseTableColumn[];
} {
  let moveNext = true;
  const columns: DatabaseTableColumn[] = [];

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
      const constraint = parseTableConstraint(cursor);
      if (constraint) moveNext = true;
    } else {
      const column = parseColumnDef(cursor);
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

  return { columns };
}

// Our parser follows this spec
// https://www.sqlite.org/lang_createtable.html
export function parseCreateTableScript(sql: string): DatabaseTableSchema {
  const tree = SQLite.language.parser.parse(sql);
  const ptr = tree.cursor();

  ptr.firstChild();
  ptr.firstChild();
  // console.log(ptr.tree?.toString());

  const cursor = new Cursor(ptr, sql);
  cursor.expectKeyword("CREATE");
  cursor.expectKeywordOptional("TEMP");
  cursor.expectKeywordOptional("TEMPORARY");
  cursor.expectKeyword("TABLE");
  cursor.expectKeywordsOptional(["IF", "NOT", "EXIST"]);
  const tableName = cursor.consumeIdentifier();

  const defCursor = cursor.enterParens();
  const defs = defCursor ? parseTableDefinition(defCursor) : { columns: [] };

  return {
    tableName,
    ...defs,
    pk: [],
    autoIncrement: false,
  };
}
