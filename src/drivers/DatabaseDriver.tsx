import * as hrana from "@libsql/hrana-client";

export interface DatabaseSchemaItem {
  name: string;
}

export interface DatabaseTableColumn {
  name: string;
  type: string;
  nullable: boolean;
  pk: boolean;
}

export interface DatabaseTableSchema {
  columns: DatabaseTableColumn[];
  pk: string[];
}

export default class DatabaseDriver {
  protected client: hrana.WsClient;
  protected stream?: hrana.WsStream;

  constructor(url: string, authToken: string) {
    this.client = hrana.openWs(url, authToken);
  }

  protected escapeId(id: string) {
    return id.replace(/"/g, '""');
  }

  protected getStream(): hrana.WsStream {
    if (this.stream) {
      if (this.stream.closed) {
        console.info("Open Stream");
        this.stream = this.client.openStream();
      }
    } else {
      console.info("Open Stream");
      this.stream = this.client.openStream();
    }

    return this.stream;
  }

  async query(stmt: hrana.InStmt) {
    const stream = this.getStream();
    const r = await stream.query(stmt);

    console.info("Querying", stmt);
    console.info("Result", r);

    return r;
  }

  async multipleQuery(statements: string[]): Promise<hrana.RowsResult | null> {
    const stream = this.getStream();
    let lastResult: hrana.RowsResult | null = null;

    for (const statement of statements) {
      lastResult = await stream.query(statement);
    }

    return lastResult;
  }

  close() {
    this.client.close();
  }

  async getTableList(): Promise<DatabaseSchemaItem[]> {
    const result = await this.query("SELECT * FROM sqlite_schema;");

    return result.rows
      .filter((row) => row.type === "table")
      .map((row) => {
        return {
          name: row.name as string,
        };
      });
  }

  async getTableSchema(tableName: string): Promise<DatabaseTableSchema> {
    const sql = "SELECT * FROM pragma_table_info(?);";
    const binding = [tableName];
    const result = await this.query([sql, binding]);

    const columns: DatabaseTableColumn[] = result.rows.map((row) => ({
      name: row.name?.toString() ?? "",
      type: row.type?.toString() ?? "",
      nullable: !row.notnull,
      pk: !!row.pk,
    }));

    return {
      columns,
      pk: columns.filter((col) => col.pk).map((col) => col.name),
    };
  }

  async selectFromTable(
    tableName: string,
    options: {
      limit: number;
      offset: number;
    }
  ): Promise<hrana.RowsResult> {
    const sql = `SELECT * FROM ${this.escapeId(tableName)} LIMIT ? OFFSET ?;`;
    const binding = [options.limit, options.offset];
    return await this.query([sql, binding]);
  }
}
