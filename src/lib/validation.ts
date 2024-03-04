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
    .map((pkColumnName) =>
      changeValue[pkColumnName] === undefined
        ? originalValue[pkColumnName]
        : changeValue[pkColumnName]
    )
    .some((value) => value === null || value === undefined);

  if (primaryKey.length === 0) {
    return {
      valid: false,
      reason:
        "This table does not have any primary key. It is not safe to perform any update/delete/insert operation.",
    };
  }

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

    if (
      url.protocol !== "wss:" &&
      url.protocol !== "libsql:" &&
      url.protocol !== "ws:"
    ) {
      return [false, "We only support wss:// or libsql:// at the moment."];
    }

    return [true, ""];
  } catch {
    return [false, "Your URL is not valid"];
  }
}

export function normalizeConnectionEndpoint(endpoint: string) {
  return endpoint.replace(/^libsql:\/\//, "wss://");
}
