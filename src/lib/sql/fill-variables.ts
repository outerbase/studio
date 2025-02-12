import { escapeSqlValue } from "@/drivers/sqlite/sql-helper";
import { Token } from "./tokenizer";

export function fillVariables(
  tokens: Token[],
  variables: Record<string, unknown>
): Token[] {
  return tokens.map((token) => {
    let placeholder = "";
    if (token.type === "PLACEHOLDER") {
      placeholder = token.value.slice(1);
    } else if (token.type === "OUTERBASE_PLACEHOLDER") {
      placeholder = token.value.slice(2, -2);
    }
    if (placeholder === "") return token;

    const variableValue = variables[placeholder];

    if (variableValue === undefined) {
      throw new Error(`Variable ${placeholder} is not defined`);
    }

    return {
      type: token.type,
      value: escapeSqlValue(variableValue),
    };
  });
}
