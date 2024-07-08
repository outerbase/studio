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
  name: string;
  content: string;
}

export interface SavedDocData extends SavedDocInput {
  id: string;
  type: SavedDocType;
  createdAt: number;
  updatedAt: number;
}

export abstract class SavedDocDriver {
  abstract getNamespaces(): Promise<SavedDocNamespace[]>;
  abstract createNamespace(name: string): Promise<SavedDocNamespace>;
  abstract updateNamespace(
    id: string,
    name: string
  ): Promise<SavedDocNamespace>;
  abstract removeNamespapce(id: string): Promise<void>;

  abstract getDocs(namespaceId: string): Promise<SavedDocData[]>;
  abstract createDoc(
    type: SavedDocType,
    namespace: string,
    data: SavedDocInput
  ): Promise<SavedDocData>;
  abstract updateDoc(id: string, data: SavedDocInput): Promise<SavedDocData>;
  abstract removeDoc(id: string): Promise<void>;
}
