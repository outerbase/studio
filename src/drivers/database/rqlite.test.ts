import { RqliteQueryable, transformRawResult } from "./rqlite";

const mockFetch = jest.fn();
global.fetch = mockFetch;

afterEach(() => {
  mockFetch.mockReset();
});

// ---------------------------------------------------------------------------
// transformRawResult
// ---------------------------------------------------------------------------

describe("transformRawResult", () => {
  it("maps columns and values into rows", () => {
    const result = transformRawResult({
      columns: ["id", "name"],
      types: ["integer", "text"],
      values: [
        [1, "Alice"],
        [2, "Bob"],
      ],
      rows_affected: 0,
      time: 2.5,
    });

    expect(result.headers).toHaveLength(2);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ id: 1, name: "Alice" });
    expect(result.rows[1]).toEqual({ id: 2, name: "Bob" });
    expect(result.stat.rowsAffected).toBe(0);
    expect(result.stat.queryDurationMs).toBe(2.5);
  });

  it("returns empty rows for non-SELECT statements", () => {
    const result = transformRawResult({
      rows_affected: 5,
      last_insert_id: 99,
    });

    expect(result.rows).toEqual([]);
    expect(result.stat.rowsAffected).toBe(5);
    expect(result.lastInsertRowid).toBe(99);
  });

  it("renames duplicate column names to avoid key collisions", () => {
    const result = transformRawResult({
      columns: ["id", "id"],
      types: ["integer", "integer"],
      values: [[1, 2]],
    });

    const names = result.headers.map((h) => h.name);
    expect(new Set(names).size).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// RqliteQueryable.testConnection
// ---------------------------------------------------------------------------

describe("RqliteQueryable.testConnection", () => {
  it("resolves when the X-Rqlite-Version header is present", async () => {
    mockFetch.mockResolvedValueOnce({
      headers: {
        get: (h: string) => (h === "X-Rqlite-Version" ? "v8.0.6" : null),
      },
    });

    const q = new RqliteQueryable("http://localhost:4001");
    await expect(q.testConnection()).resolves.toBeUndefined();

    expect(mockFetch).toHaveBeenCalledWith("http://localhost:4001/", {
      method: "GET",
      redirect: "manual",
    });
  });

  it("throws a descriptive error when the header is absent", async () => {
    mockFetch.mockResolvedValueOnce({
      headers: { get: () => null },
    });

    const q = new RqliteQueryable("http://localhost:4001");
    await expect(q.testConnection()).rejects.toThrow(
      "does not appear to be an rqlite node"
    );
  });

  it("throws when the fetch itself fails (network error)", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const q = new RqliteQueryable("http://localhost:4001");
    await expect(q.testConnection()).rejects.toThrow(
      "Cannot reach rqlite at http://localhost:4001"
    );
  });

  it("does not send auth credentials during the probe", async () => {
    mockFetch.mockResolvedValueOnce({
      headers: {
        get: (h: string) => (h === "X-Rqlite-Version" ? "v8.0.6" : null),
      },
    });

    const q = new RqliteQueryable("http://localhost:4001", "admin", "secret");
    await q.testConnection();

    const [, init] = mockFetch.mock.calls[0];
    expect(init?.headers).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// RqliteQueryable.transaction (connection validation integration)
// ---------------------------------------------------------------------------

describe("RqliteQueryable.transaction", () => {
  it("validates the connection before the first transaction", async () => {
    mockFetch
      .mockResolvedValueOnce({
        // testConnection probe
        headers: {
          get: (h: string) => (h === "X-Rqlite-Version" ? "v8.0.6" : null),
        },
      })
      .mockResolvedValueOnce({
        // actual query
        json: async () => ({
          results: [
            { columns: ["n"], types: ["integer"], values: [[42]] },
          ],
        }),
      });

    const q = new RqliteQueryable("http://localhost:4001");
    const results = await q.transaction(["SELECT 42 AS n"]);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(results[0].rows[0]).toEqual({ n: 42 });
  });

  it("skips the probe on subsequent transactions (cached)", async () => {
    mockFetch
      .mockResolvedValueOnce({
        headers: {
          get: (h: string) => (h === "X-Rqlite-Version" ? "v8.0.6" : null),
        },
      })
      .mockResolvedValueOnce({
        json: async () => ({ results: [{ rows_affected: 0 }] }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ results: [{ rows_affected: 0 }] }),
      });

    const q = new RqliteQueryable("http://localhost:4001");
    await q.transaction(["SELECT 1"]);
    await q.transaction(["SELECT 2"]);

    // 1 probe + 2 query calls = 3 total (not 4)
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("propagates a failed probe as an error before any query runs", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const q = new RqliteQueryable("http://localhost:4001");
    await expect(q.transaction(["SELECT 1"])).rejects.toThrow(
      "Cannot reach rqlite at http://localhost:4001"
    );

    // The query fetch must NOT have been called
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("sends Basic auth on query requests when credentials are provided", async () => {
    mockFetch
      .mockResolvedValueOnce({
        headers: {
          get: (h: string) => (h === "X-Rqlite-Version" ? "v8.0.6" : null),
        },
      })
      .mockResolvedValueOnce({
        json: async () => ({ results: [{ rows_affected: 0 }] }),
      });

    const q = new RqliteQueryable("http://localhost:4001", "admin", "s3cr3t");
    await q.transaction(["DELETE FROM t WHERE 0=1"]);

    const [, queryInit] = mockFetch.mock.calls[1];
    expect((queryInit?.headers as Record<string, string>)["Authorization"]).toBe(
      "Basic " + btoa("admin:s3cr3t")
    );
  });
});

// ---------------------------------------------------------------------------
// RqliteQueryable.query (delegates to transaction)
// ---------------------------------------------------------------------------

describe("RqliteQueryable.query", () => {
  it("validates the connection and returns the first result set", async () => {
    mockFetch
      .mockResolvedValueOnce({
        headers: {
          get: (h: string) => (h === "X-Rqlite-Version" ? "v8.0.6" : null),
        },
      })
      .mockResolvedValueOnce({
        json: async () => ({
          results: [{ columns: ["val"], types: ["text"], values: [["hello"]] }],
        }),
      });

    const q = new RqliteQueryable("http://localhost:4001");
    const result = await q.query("SELECT 'hello' AS val");

    expect(result.rows[0]).toEqual({ val: "hello" });
  });
});
