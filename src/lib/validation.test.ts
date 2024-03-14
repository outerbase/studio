import { validateConnectionEndpoint, validateOperation } from "./validation";

describe("Operation Validation", () => {
  it("UPDATE with primary key SHOULD be valid operation", () => {
    const result = validateOperation({
      operation: "UPDATE",
      autoIncrement: false,
      originalValue: {
        id: 5,
        name: "Visal",
      },
      changeValue: {
        name: "Jame",
      },
      primaryKey: ["id"],
    });

    expect(result.valid).toBe(true);
  });

  it("UPDATE without primary key SHOULD NOT be valid operation", () => {
    const result = validateOperation({
      operation: "UPDATE",
      autoIncrement: false,
      originalValue: {
        id: 5,
        name: "Visal",
      },
      changeValue: {
        name: "Jame",
      },
      primaryKey: [],
    });

    expect(result.valid).toBe(false);
  });

  it("UPDATE with row NULL as value for primary key SHOULD NOT be valid operation", () => {
    const result = validateOperation({
      operation: "UPDATE",
      autoIncrement: false,
      originalValue: {
        id: null,
        name: "Visal",
      },
      changeValue: {
        name: "Jame",
      },
      primaryKey: ["id"],
    });
    expect(result.valid).toBe(false);
  });

  it("UPDATE with NULL as value for any one of primary key SHOULD NOT be valid operation", () => {
    const result = validateOperation({
      operation: "UPDATE",
      autoIncrement: false,
      originalValue: {
        id: null,
        name: "Visal",
        age: 57,
      },
      changeValue: {
        age: 67,
      },
      primaryKey: ["id", "name"],
    });
    expect(result.valid).toBe(false);
  });

  it("UPDATE primary key to NULL SHOULD NOT be valid operation", () => {
    const result = validateOperation({
      operation: "UPDATE",
      autoIncrement: false,
      originalValue: {
        id: 3,
        name: "Visal",
      },
      changeValue: {
        id: null,
        name: "Jame",
      },
      primaryKey: ["id"],
    });
    expect(result.valid).toBe(false);
  });

  it("DELETE row with primary key SHOULD be valid operation", () => {
    const result = validateOperation({
      operation: "DELETE",
      autoIncrement: false,
      originalValue: {
        id: 3,
        name: "Visal",
      },
      changeValue: {},
      primaryKey: ["id"],
    });
    expect(result.valid).toBe(true);
  });

  it("DELETE row without primary key SHOULD NOT be valid operation", () => {
    const result = validateOperation({
      operation: "DELETE",
      autoIncrement: false,
      originalValue: {
        id: 3,
        name: "Visal",
      },
      changeValue: {},
      primaryKey: [],
    });
    expect(result.valid).toBe(false);
  });

  it("DELETE row with NULL primary key SHOULD NOT be valid operation", () => {
    const result = validateOperation({
      operation: "DELETE",
      autoIncrement: false,
      originalValue: {
        id: null,
        name: "Visal",
      },
      changeValue: {},
      primaryKey: ["id"],
    });
    expect(result.valid).toBe(false);
  });

  it("INSERT with primary key SHOULD be valid operation", () => {
    const result = validateOperation({
      operation: "INSERT",
      autoIncrement: false,
      originalValue: {},
      changeValue: {
        id: 5,
        name: "Visal",
      },
      primaryKey: ["id"],
    });
    expect(result.valid).toBe(true);
  });

  it("INSERT with primary key with NULL value SHOULD NOT be valid operation", () => {
    const result = validateOperation({
      operation: "INSERT",
      autoIncrement: false,
      originalValue: {},
      changeValue: {
        id: null,
        name: "Visal",
      },
      primaryKey: ["id"],
    });
    expect(result.valid).toBe(false);
  });

  it("INSERT with auto increment primary key with NULL value SHOULD NOT be valid operation", () => {
    const result = validateOperation({
      operation: "INSERT",
      autoIncrement: true,
      originalValue: {},
      changeValue: {
        id: null,
        name: "Visal",
      },
      primaryKey: ["id"],
    });
    expect(result.valid).toBe(false);
  });

  it("INSERT with one of primary key with NULL value SHOULD NOT be valid operation", () => {
    const result = validateOperation({
      operation: "INSERT",
      autoIncrement: false,
      originalValue: {},
      changeValue: {
        id: 15,
        name: null,
      },
      primaryKey: ["id", "name"],
    });
    expect(result.valid).toBe(false);
  });

  it("INSERT with primary key with no value but it is auto increment primary key SHOULD be valid operation", () => {
    const result = validateOperation({
      operation: "INSERT",
      autoIncrement: true,
      originalValue: {},
      changeValue: {
        name: "Visal",
      },
      primaryKey: ["id"],
    });
    expect(result.valid).toBe(true);
  });
});

describe("Validate the connection endpoint", () => {
  it("wss:// is valid endpoint", () => {
    expect(validateConnectionEndpoint("wss://testing.example.com")[0]).toBe(
      true
    );
  });

  it("Non wss:// is not valid endpoint", () => {
    expect(validateConnectionEndpoint("https://testing.example.com")[0]).toBe(
      true
    );
  });
});
