export type SavedDocType = "sql";

export interface SavedDocNamespaceInput {
  name: string;
}

export interface SavedDocNamespace extends SavedDocNamespaceInput {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export interface SavedDocInput {
  id: string;
  name: string;
  content: string;
}

export interface SavedDocData extends SavedDocInput {
  type: SavedDocType;
  createdAt: number;
  updatedAt: number;
}

export abstract class SavedQueryDriver {
  abstract getNamespaces(): Promise<SavedDocNamespace[]>;
  abstract createNamespace(name: string): Promise<SavedDocNamespace>;
  abstract updateNamespace(
    id: string,
    name: string
  ): Promise<SavedDocNamespace>;
  abstract removeNamespapce(id: string): Promise<void>;

  abstract getQueries(namespaceId: string): Promise<SavedDocData[]>;
  abstract createQuery(
    type: SavedDocType,
    namespace: string,
    data: SavedDocInput
  ): Promise<SavedDocData>;
  abstract updateQuery(id: string, data: SavedDocInput): Promise<SavedDocData>;
  abstract removeQuery(id: string): Promise<void>;
}
