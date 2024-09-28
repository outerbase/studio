import Dexie, { EntityTable } from "dexie";

interface IndexDbNamespace {
  id: string;
  database_id: string;
  name: string;
  created_at: number;
  updated_at: number;
}

interface IndexDbDoc {
  id: string;
  database_id: string;
  namespace_id: string;
  name: string;
  type: string;
  content: string;
  created_at: number;
  updated_at: number;
}

interface IndexDbFileHandler {
  id: string;
  handler: FileSystemFileHandle;
}

const localDb = new Dexie("libstudio") as Dexie & {
  namespace: EntityTable<IndexDbNamespace, "id">;
  saved_doc: EntityTable<IndexDbDoc, "id">;
  file_handler: EntityTable<IndexDbFileHandler, "id">;
};

localDb.version(2).stores({
  namespace: "++id, database_id",
  saved_doc: "++id, database_id, namespace_id",
  file_handler: "++id, handler",
});

export { localDb };
