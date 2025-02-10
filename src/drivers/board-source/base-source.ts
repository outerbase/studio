import { DatabaseSchemas } from "../base-driver";

export interface BoardSource {
  id: string;
  name: string;
  type: string;
}

export abstract class BoardSourceDriver {
  abstract sourceList(): BoardSource[];
  abstract query(
    sourceId: string,
    statement: string
  ): Promise<Record<string, unknown>[]>;
  abstract schemas(
    sourceId: string
  ): Promise<{ schema: DatabaseSchemas; selectedSchema?: string }>;
  abstract cleanup(): void;
}
