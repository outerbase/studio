import {
  DatabaseTableOperation,
  DatabaseTableSchema,
} from "@/drivers/base-driver";

export function validateOperation(
  op: DatabaseTableOperation,
  validateSchema: DatabaseTableSchema
): { valid: boolean; reason?: string } {
  const operation = op.operation;
  const primaryKey = validateSchema.pk;
  const originalValue = op.operation !== "INSERT" ? op.where : {};
  const changeValue = op.operation !== "DELETE" ? op.values : {};
  const autoIncrement = validateSchema.autoIncrement;

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
      url.protocol !== "ws:" &&
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return [
        false,
        "We only support wss://, ws://, http://, https://, libsql:// at the moment.",
      ];
    }

    return [true, ""];
  } catch {
    return [false, "Your URL is not valid"];
  }
}

export function isLinkString(str: string) {
  if (str.length > 200) return false;
  try {
    return Boolean(new URL(str));
  } catch {
    return false;
  }
}
