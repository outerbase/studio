export function validateOperation({
  operation,
  primaryKey,
  originalValue,
  changeValue,
  autoIncrement,
}: {
  operation: "INSERT" | "UPDATE" | "DELETE";
  autoIncrement: boolean;
  primaryKey: string[];
  originalValue: Record<string, unknown>;
  changeValue: Record<string, unknown>;
}): { valid: boolean; reason?: string } {
  const hasAnyPrimaryKeyNull = primaryKey
    .map((pkColumnName) => originalValue[pkColumnName])
    .some((value) => value === null || value === undefined);

  const hasAnyUpdatePrimaryKeyNull = primaryKey
    .map((pkColumnName) => changeValue[pkColumnName])
    .some((value) => value === null || value === undefined);

  if (operation === "DELETE") {
    if (hasAnyPrimaryKeyNull)
      return {
        valid: false,
        reason: "It is not safe to remove row with NULL in primary key column",
      };
  } else if (operation === "UPDATE") {
    if (hasAnyPrimaryKeyNull) {
      return {
        valid: false,
        reason: "It is not safe to update row with NULL in primary key column",
      };
    } else if (hasAnyUpdatePrimaryKeyNull) {
      return {
        valid: false,
        reason: "It is not safe to update row to NULL in primary key column",
      };
    }
  } else {
    // If it is INSERT operation and also have auto increment
    if (autoIncrement && changeValue[primaryKey[0]] === null) {
      return {
        valid: false,
        reason: "It is not safe to insert row with NULL in primary key column",
      };
    } else if (!autoIncrement && hasAnyUpdatePrimaryKeyNull) {
      return {
        valid: false,
        reason: "It is not safe to insert row with NULL in primary key column",
      };
    }
  }

  return { valid: true };
}

export function validateConnectionEndpoint(
  endpoint: string
): [boolean, string] {
  try {
    const url = new URL(endpoint);

    if (url.protocol !== "wss:") {
      return [true, "We only support wss:// at the moment."];
    }

    return [false, ""];
  } catch {
    return [true, "Your URL is not valid"];
  }
}
