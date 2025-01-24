import { SavedDocNamespace } from "./drivers/saved-doc/saved-doc-driver";
import { DatabaseResultSet } from "./drivers/base-driver";

export {};

interface OuterbaseIPC {
  docs?: {
    load(): Promise<{
      namespace: SavedDocNamespace[];
      docs: Record<string, SavedDocData[]>;
    } | null>;

    save(data: {
      namespace: SavedDocNamespace[];
      docs: Record<string, SavedDocData[]>;
    }): Promise<void>;
  };
  query(statement: string): Promise<DatabaseResultSet>;
  transaction(statements: string[]): Promise<DatabaseResultSet[]>;
  close(): void;
}

declare global {
  interface Window {
    outerbaseIpc?: OuterbaseIPC;
  }
}
