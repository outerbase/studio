import { BaseDriver, DatabaseResultSet, DatabaseSchemas } from "../base-driver";

export interface BoardSource {
  id: string;
  name: string;
  type: string;
}

export abstract class BoardSourceDriver {
  abstract sourceList(): BoardSource[];
  abstract getDriver(sourceId: string): BaseDriver;
  abstract query(
    sourceId: string,
    statement: string
  ): Promise<DatabaseResultSet>;
  abstract schemas(
    sourceId: string
  ): Promise<{ schema: DatabaseSchemas; selectedSchema?: string }>;
  abstract cleanup(): void;
}
