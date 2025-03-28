import { parseCreateViewScript } from "./sql-parse-view";

describe("parse", () => {
  test("parsing simple view", () => {
    const view = parseCreateViewScript(
      "main",
      `CREATE VIEW COMPANY_VIEW AS SELECT ID, NAME, AGE FROM COMPANY;`
    );
    expect(view).toMatchObject({
      schemaName: "main",
      name: "COMPANY_VIEW",
      statement: "SELECT ID, NAME, AGE FROM COMPANY",
    });
  });

  test("parsing view with temporary keyword", () => {
    const view = parseCreateViewScript(
      "main",
      `CREATE TEMPORARY VIEW TEMP_VIEW AS SELECT * FROM USERS;`
    );
    expect(view).toMatchObject({
      schemaName: "main",
      name: "TEMP_VIEW",
      statement: "SELECT * FROM USERS",
    });
  });

  test("parsing view with temp keyword", () => {
    const view = parseCreateViewScript(
      "main",
      `CREATE TEMP VIEW TEMP_VIEW AS SELECT * FROM USERS;`
    );
    expect(view).toMatchObject({
      schemaName: "main",
      name: "TEMP_VIEW",
      statement: "SELECT * FROM USERS",
    });
  });

  test("parsing view with IF NOT EXISTS", () => {
    const view = parseCreateViewScript(
      "custom",
      `CREATE VIEW IF NOT EXIST USER_STATS AS SELECT COUNT(*) AS user_count FROM USERS;`
    );
    expect(view).toMatchObject({
      schemaName: "custom",
      name: "USER_STATS",
      statement: "SELECT COUNT(*) AS user_count FROM USERS",
    });
  });

  test("parsing complex view with joins", () => {
    const view = parseCreateViewScript(
      "main",
      `CREATE VIEW ORDER_DETAILS AS 
       SELECT o.id, o.date, c.name, p.title 
       FROM orders o 
       JOIN customers c ON o.customer_id = c.id 
       JOIN products p ON o.product_id = p.id;`
    );
    expect(view).toMatchObject({
      schemaName: "main",
      name: "ORDER_DETAILS",
      statement: `SELECT o.id, o.date, c.name, p.title 
       FROM orders o 
       JOIN customers c ON o.customer_id = c.id 
       JOIN products p ON o.product_id = p.id`,
    });
  });

  test("parsing view with subquery", () => {
    const view = parseCreateViewScript(
      "analytics",
      `CREATE VIEW TOP_CUSTOMERS AS 
       SELECT customer_id, SUM(amount) as total 
       FROM (SELECT * FROM transactions WHERE status = 'completed') 
       GROUP BY customer_id 
       ORDER BY total DESC;`
    );
    expect(view).toMatchObject({
      schemaName: "analytics",
      name: "TOP_CUSTOMERS",
      statement: `SELECT customer_id, SUM(amount) as total 
       FROM (SELECT * FROM transactions WHERE status = 'completed') 
       GROUP BY customer_id 
       ORDER BY total DESC`,
    });
  });
});
