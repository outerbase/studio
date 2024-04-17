## LibSQL Studio GUI

LibSQL Studio GUI is a standalone database GUI React component for SQLite.

```typescript
import { Studio } from "@libsqlstudio/gui";
import TursoDriver from "./driver";

export default App() {
    const driver = useMemo(() => {
        return new TursoDriver("url_here", "token");
    }, [])

    return <Studio
      driver={driver}
      name="Turso Connection"
      theme="light"
      color="blue"
    />
}
```

Implementing SQLite Driver

```typescript
// driver.ts
import {
  createClient,
  Client,
  InStatement,
  ResultSet,
} from "@libsql/client/web";
import {
  SqliteLikeBaseDriver,
  DatabaseHeader,
  DatabaseResultSet,
  DatabaseRow,
  convertSqliteType,
} from "@libsqlstudio/gui/driver";

export default class TursoDriver extends SqliteLikeBaseDriver {
  protected client: Client;
  protected endpoint: string = "";
  protected authToken = "";
  protected bigInt = false;

  constructor(url: string, authToken: string) {
    super();
    this.endpoint = url;
    this.authToken = authToken;

    this.client = createClient({
      url: this.endpoint,
      authToken: this.authToken,
    });
  }

  supportBigInt(): boolean {
    return false;
  }

  async query(stmt: InStatement) {
    const r = await this.client.execute(stmt);
    return transformRawResult(r);
  }

  async transaction(stmt: InStatement[]) {
    return (await this.client.batch(stmt, "write")).map(transformRawResult);
  }
}

function transformRawResult(raw: ResultSet): DatabaseResultSet {
  const headerSet = new Set();

  const headers: DatabaseHeader[] = raw.columns.map((colName, colIdx) => {
    const colType = raw.columnTypes[colIdx];
    let renameColName = colName;

    for (let i = 0; i < 20; i++) {
      if (!headerSet.has(renameColName)) break;
      renameColName = `__${colName}_${i}`;
    }

    headerSet.add(renameColName);

    return {
      name: renameColName,
      displayName: colName,
      originalType: colType,
      type: convertSqliteType(colType),
    };
  });

  const rows = raw.rows.map((r) =>
    headers.reduce((a, b, idx) => {
      a[b.name] = r[idx];
      return a;
    }, {} as DatabaseRow)
  );

  return {
    rows,
    rowsAffected: raw.rowsAffected,
    headers,
    lastInsertRowid:
      raw.lastInsertRowid === undefined
        ? undefined
        : Number(raw.lastInsertRowid),
  };
}
```
