import { parseCreateTriggerScript } from "./sql-parse-trigger";

function generateSql({
  name,
  when,
  operation,
  columnNames,
  tableName,
  statement,
}: Record<string, string>) {
  let whenString = "";
  if (when) {
    whenString = `${when} `;
  }
  let columnNameString = "";
  if (columnNames) {
    columnNameString = ` ${columnNames}`;
  }
  return `
    CREATE TRIGGER ${name}
    ${whenString}${operation}${columnNameString} ON ${tableName}
    BEGIN
      ${statement}
    END;
  `;
}

describe("parse trigger", () => {
  const name = "cust_addr_chng";
  const tableName = "customer_address";
  const statement = `UPDATE customer SET cust_addr=NEW.cust_addr WHERE cust_id=NEW.cust_id;`;
  it("when: BEFORE", () => {
    const deleteOutput = parseCreateTriggerScript(
      "main",
      generateSql({ name, operation: "DELETE", tableName, statement })
    );
    expect(deleteOutput).toMatchObject({
      name: name,
      when: "BEFORE",
      operation: "DELETE",
      tableName: tableName,
      statement: statement,
    });

    const insert = parseCreateTriggerScript(
      "main",
      generateSql({
        name,
        operation: "INSERT",
        tableName,
        statement: statement + statement,
      })
    );
    expect(insert).toMatchObject({
      name: name,
      when: "BEFORE",
      operation: "INSERT",
      tableName: tableName,
      statement: statement + statement,
    });

    const updateOf = parseCreateTriggerScript(
      "main",
      generateSql({
        name,
        operation: "UPDATE OF",
        columnNames: "cust_addr",
        tableName,
        statement,
      })
    );
    expect(updateOf).toMatchObject({
      name: name,
      when: "BEFORE",
      operation: "UPDATE",
      columnNames: ["cust_addr"],
      tableName: tableName,
      statement: statement,
    });
  });

  it("when: AFTER", () => {
    const deleteOutput = parseCreateTriggerScript(
      "main",
      generateSql({
        name,
        when: "AFTER",
        operation: "DELETE",
        tableName,
        statement,
      })
    );
    expect(deleteOutput).toMatchObject({
      name: name,
      when: "AFTER",
      operation: "DELETE",
      tableName: tableName,
      statement: statement,
    });

    const insert = parseCreateTriggerScript(
      "main",
      generateSql({
        name,
        when: "AFTER",
        operation: "INSERT",
        tableName,
        statement,
      })
    );
    expect(insert).toMatchObject({
      name: name,
      when: "AFTER",
      operation: "INSERT",
      tableName: tableName,
      statement: statement,
    });

    const updateOf = parseCreateTriggerScript(
      "main",
      generateSql({
        name,
        when: "AFTER",
        operation: "UPDATE OF",
        columnNames: "cust_addr",
        tableName,
        statement,
      })
    );
    expect(updateOf).toMatchObject({
      name: name,
      when: "AFTER",
      operation: "UPDATE",
      columnNames: ["cust_addr"],
      tableName: tableName,
      statement: statement,
    });
  });

  it("when: INSTEAD OF", () => {
    const deleteOutput = parseCreateTriggerScript(
      "main",
      generateSql({
        name,
        when: "INSTEAD OF",
        operation: "DELETE",
        tableName,
        statement,
      })
    );
    expect(deleteOutput).toMatchObject({
      name: name,
      when: "INSTEAD_OF",
      operation: "DELETE",
      tableName: tableName,
      statement: statement,
    });

    const insert = parseCreateTriggerScript(
      "main",
      generateSql({
        name,
        when: "INSTEAD OF",
        operation: "INSERT",
        tableName,
        statement,
      })
    );
    expect(insert).toMatchObject({
      name: name,
      when: "INSTEAD_OF",
      operation: "INSERT",
      tableName: tableName,
      statement: statement,
    });

    const updateOf = parseCreateTriggerScript(
      "main",
      generateSql({
        name,
        when: "INSTEAD OF",
        operation: "UPDATE OF",
        columnNames: "cust_addr",
        tableName,
        statement,
      })
    );
    expect(updateOf).toMatchObject({
      name: name,
      when: "INSTEAD_OF",
      operation: "UPDATE",
      columnNames: ["cust_addr"],
      tableName: tableName,
      statement: statement,
    });
  });
});
