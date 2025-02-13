import { SupportedDialect } from "@/drivers/base-driver";

export interface Token {
  type: string;
  value: string;
}

const tokenTypes: {
  type: string;
  findToken: (input: string, dialect?: SupportedDialect) => string | null;
}[] = [
  {
    type: "WHITESPACE",
    findToken: (input) => {
      const regex = /^\s+/;
      const match = regex.exec(input);
      return match?.[0] ?? null;
    },
  },
  {
    type: "IDENTIFIER",
    findToken: (input) => {
      const regex =
        /^(`[^(`\n)]+`|"[^("\n)]+"|\[[^(\]\n)]+\]|[a-zA-Z_][a-zA-Z0-9_]*)/;
      const match = regex.exec(input);
      return match?.[0] ?? null;
    },
  },
  {
    type: "STRING",
    findToken: (input) => {
      const regex = /^(?:'(?:[^('\n)]|'')*'|"(?:[^("\n)]|"")*")/;
      const match = regex.exec(input);
      return match?.[0] ?? null;
    },
  },

  {
    type: "NUMBER",
    findToken: (input) => {
      const regex = /^\d+(\.\d+)?/;
      const match = regex.exec(input);
      return match?.[0] ?? null;
    },
  },
  {
    type: "PLACEHOLDER",
    findToken: (input) => {
      const regex = /^:[a-zA-Z_][a-zA-Z0-9_]*/;
      const match = regex.exec(input);
      return match?.[0] ?? null;
    },
  },
  {
    type: "OUTERBASE_PLACEHOLDER",
    findToken: (input) => {
      const regex = /^\{\{[a-zA-Z0-9_]+\}\}/;
      const match = regex.exec(input);
      return match?.[0] ?? null;
    },
  },
  {
    type: "COMMENT",
    findToken: (input, dialect) => {
      let regex = /^(--.*|\/\*[\s\S]*?\*\/)/; // -- comment, /* comment */
      if (dialect === "mysql") regex = /^(--.*|#.*|\/\*[\s\S]*?\*\/)/; // for mysql, # is also used for comments

      const match = regex.exec(input);
      return match?.[0] ?? null;
    },
  },
  {
    type: "OPERATOR",
    findToken: (input) => {
      const regex = /^(=|<>|!=|<|>|<=|>=|\+|-|\*|\/)/;
      const match = regex.exec(input);
      return match?.[0] ?? null;
    },
  },
  {
    type: "PUNCTUATION",
    findToken: (input) => {
      const regex = /^[`,;().]/;
      const match = regex.exec(input);
      return match?.[0] ?? null;
    },
  },
];

export function tokenizeSql(sql: string, dialect: SupportedDialect): Token[] {
  try {
    const tokens: Token[] = [];
    let cursor = 0;
    const length = sql.length;
    let unknownAcc = "";

    while (cursor < length) {
      let matched = false;
      const subStr = sql.substring(cursor);
      for (const { type, findToken } of tokenTypes) {
        const match = findToken(subStr, dialect);
        if (match) {
          if (unknownAcc !== "") {
            tokens.push({ type: "UNKNOWN", value: unknownAcc });
            unknownAcc = "";
          }

          tokens.push({ type, value: match });
          cursor += match.length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        unknownAcc += subStr[0];
        cursor++;
      }
    }
    if (unknownAcc !== "") tokens.push({ type: "UNKNOWN", value: unknownAcc });
    return tokens;
  } catch (e) {
    return [{ type: "SQL", value: sql }];
  }
}
