import Dexie, { EntityTable } from "dexie";
import { SavedConnectionRawLocalStorage } from "./app/(theme)/connect/saved-connection-storage";
import { DashboardProps } from "./components/board";

export interface LocalDashboardData extends DashboardProps {
  id: string;
  created_at: number;
  updated_at: number;
}
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

interface IndexDbBoard {
  id: string;
  content: LocalDashboardData;
}

export interface LocalConnectionData {
  id: string;
  content: SavedConnectionRawLocalStorage;
  created_at: number;
  updated_at: number;
}

const localDb = new Dexie("libstudio") as Dexie & {
  namespace: EntityTable<IndexDbNamespace, "id">;
  saved_doc: EntityTable<IndexDbDoc, "id">;
  file_handler: EntityTable<IndexDbFileHandler, "id">;
  board: EntityTable<IndexDbBoard, "id">;
  connection: EntityTable<LocalConnectionData, "id">;
};

localDb.version(4).stores({
  namespace: "++id, database_id",
  saved_doc: "++id, database_id, namespace_id",
  file_handler: "++id, handler",
  board: "++id",
  connection: "++id",
});

export { localDb };
