import { RqliteQueryable, transformRawResult } from "./rqlite";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

afterEach(() => {
  mockFetch.mockReset();
});

describe("transformRawResult", () => {
  it("maps columns and values to rows", () => {
    const result = transformRawResult({
      columns: ["id", "name"],
      types: ["integer", "text"],
      values: [
        [1, "Alice"],
        [2, "Bob"],
      ],
      rows_affected: 0,
      time: 1.5,
    });

    expect(result.headers).toHaveLength(2);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ id: 1, name: "Alice" });
    expect(result.stat.rowsAffected).toBe(0);
    expect(result.stat.queryDurationMs).toBe(1.5);
  });

  it("handles missing values (non-SELECT statements)", () => {
    const result = transformRawResult({
      rows_affected: 3,
      last_insert_id: 42,
    });

    expect(result.rows).toEqual([]);
    expect(result.stat.rowsAffected).toBe(3);
    expect(result.lastInsertRowid).toBe(42);
  });
});

describe("RqliteQueryable.testConnection", () => {
  it("resolves when X-Rqlite-Version header is present", async () => {
    mockFetch.mockResolvedValueOnce({
      headers: { get: (h: string) => (h === "X-Rqlite-Version" ? "v8.0.0" : null) },
    });

    const q = new RqliteQueryable("http://localhost:4001");
    await expect(q.testConnection()).resolves.toBeUndefined();

    expect(mockFetch).toHaveBeenCalledWith("http://localhost:4001/", {
      method: "GET",
      redirect: "manual",
    });
  });

  it("throws when X-Rqlite-Version header is absent", async () => {
    mockFetch.mockResolvedValueOnce({
      headers: { get: () => null },
    });

    const q = new RqliteQueryable("http://localhost:4001");
    await expect(q.testConnection()).rejects.toThrow(
      "does not appear to be an rqlite node"
    );
  });

  it("throws with a descriptive message when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const q = new RqliteQueryable("http://localhost:4001");
    await expect(q.testConnection()).rejects.toThrow(
      "Unable to reach rqlite at http://localhost:4001"
    );
  });
});

describe("RqliteQueryable.transaction", () => {
  it("calls testConnection before the first transaction", async () => {
    // testConnection fetch
    mockFetch.mockResolvedValueOnce({
      headers: { get: (h: string) => (h === "X-Rqlite-Version" ? "v8.0.0" : null) },
    });
    // transaction fetch
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        results: [{ columns: ["n"], types: ["integer"], values: [[1]] }],
      }),
    });

    const q = new RqliteQueryable("http://localhost:4001");
    const results = await q.transaction(["SELECT 1 AS n"]);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(results[0].rows[0]).toEqual({ n: 1 });
  });

  it("skips testConnection on subsequent calls", async () => {
    // First testConnection + first transaction
    mockFetch
      .mockResolvedValueOnce({
        headers: { get: (h: string) => (h === "X-Rqlite-Version" ? "v8.0.0" : null) },
      })
      .mockResolvedValueOnce({
        json: async () => ({ results: [{ rows_affected: 0 }] }),
      })
      // Second transaction — no testConnection call
      .mockResolvedValueOnce({
        json: async () => ({ results: [{ rows_affected: 0 }] }),
      });

    const q = new RqliteQueryable("http://localhost:4001");
    await q.transaction(["SELECT 1"]);
    await q.transaction(["SELECT 2"]);

    // Only 3 total calls (1 test + 2 transactions), not 4
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("adds Basic auth header when credentials are provided", async () => {
    mockFetch
      .mockResolvedValueOnce({
        headers: { get: (h: string) => (h === "X-Rqlite-Version" ? "v8.0.0" : null) },
      })
      .mockResolvedValueOnce({
        json: async () => ({ results: [{ rows_affected: 0 }] }),
      });

    const q = new RqliteQueryable("http://localhost:4001", "admin", "secret");
    await q.transaction(["DELETE FROM t WHERE 1=0"]);

    const transactionCall = mockFetch.mock.calls[1];
    const headers = transactionCall[1].headers;
    expect(headers["Authorization"]).toBe(
      "Basic " + btoa("admin:secret")
    );
  });
});
