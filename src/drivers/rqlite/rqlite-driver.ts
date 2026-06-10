import { BaseDriver, DatabaseResultSet, TableColumn } from "../base-driver";
import { HttpStatus } from "../../constants/http-status";

export class RqliteDriver extends BaseDriver {
  private url: string;
  private authToken?: string;

  constructor(url: string, authToken?: string) {
    super();
    this.url = url;
    this.authToken = authToken;
  }

  async isSupported(): Promise<boolean> {
    return true;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.url}/status`, {
        headers: this.getHeaders(),
      });
      
      // Check for X-Rqlite-Version header as mentioned in the issue
      const versionHeader = response.headers.get("X-Rqlite-Version");
      return response.status === HttpStatus.OK && versionHeader !== null;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    const result = await this.query(
      `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`
    );
    return result.rows.map((row) => row.name as string);
  }

  async getColumns(tableName: string): Promise<TableColumn[]> {
    const result = await this.query(`PRAGMA table_info("${tableName}")`);
    return result.rows.map((row) => ({
      name: row.name as string,
      type: row.type as string,
      notnull: row.notnull === 1,
      dflt_value: row.dflt_value as string | null,
      pk: row.pk === 1,
    }));
  }

  async query(statement: string): Promise<DatabaseResultSet> {
    const response = await fetch(`${this.url}/db/execute`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify([statement]),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle rqlite response format
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      
      if (result.error) {
        throw new Error(result.error);
      }

      return {
        rows: result.values
          ? result.values.map((row: any[]) => {
              const obj: Record<string, any> = {};
              result.columns?.forEach((col: string, i: number) => {
                obj[col] = row[i];
              });
              return obj;
            })
          : [],
        columns: result.columns || [],
        rowsAffected: result.rows_affected || 0,
        lastInsertRowid: result.last_insert_id || undefined,
      };
    }

    return {
      rows: [],
      columns: [],
      rowsAffected: 0,
    };
  }

  async transaction(statements: string[]): Promise<DatabaseResultSet[]> {
    const response = await fetch(`${this.url}/db/execute`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(statements),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.results.map((result: any) => {
      if (result.error) {
        throw new Error(result.error);
      }

      return {
        rows: result.values
          ? result.values.map((row: any[]) => {
              const obj: Record<string, any> = {};
              result.columns?.forEach((col: string, i: number) => {
                obj[col] = row[i];
              });
              return obj;
            })
          : [],
        columns: result.columns || [],
        rowsAffected: result.rows_affected || 0,
        lastInsertRowid: result.last_insert_id || undefined,
      };
    });
  }

  async dump(): Promise<string> {
    // First test connection to ensure we're talking to an rqlite node
    const isConnected = await this.testConnection();
    if (!isConnected) {
      throw new Error("Failed to connect to rqlite node");
    }

    try {
      // Get all tables
      const tables = await this.getTables();
      const dumpStatements: string[] = [];

      for (const table of tables) {
        // Get CREATE TABLE statement
        const createResult = await this.query(
          `SELECT sql FROM sqlite_master WHERE type='table' AND name='${table}'`
        );
        
        if (createResult.rows.length > 0) {
          const createStatement = createResult.rows[0].sql as string;
          dumpStatements.push(createStatement + ";");
        }

        // Get table data
        const dataResult = await this.query(`SELECT * FROM "${table}"`);
        
        if (dataResult.rows.length > 0) {
          for (const row of dataResult.rows) {
            const columns = Object.keys(row);
            const values = columns.map(col => {
              const value = row[col];
              if (value === null) return "NULL";
              if (typeof value === "number") return value;
              return `'${String(value).replace(/'/g, "''")}'`;
            });
            
            dumpStatements.push(
              `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(", ")}) VALUES (${values.join(", ")});`
            );
          }
        }
      }

      return dumpStatements.join("\n");
    } catch (error) {
      console.error("Database dump failed:", error);
      throw new Error(`Failed to create database dump: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    return headers;
  }
}