import { localDb } from "@/indexdb";
import { generateId } from "@/lib/generate-id";
import {
  SavedDocData,
  SavedDocDriver,
  SavedDocGroupByNamespace,
  SavedDocInput,
  SavedDocNamespace,
  SavedDocType,
} from "./saved-doc-driver";

export default class IndexdbSavedDoc implements SavedDocDriver {
  protected cb: (() => void)[] = [];
  protected databaseId: string;

  constructor(databaseId: string) {
    this.databaseId = databaseId;
  }

  async createNamespace(name: string): Promise<SavedDocNamespace> {
    const now = Math.floor(Date.now() / 1000);
    const id = generateId();

    await localDb.namespace.add({
      id,
      database_id: this.databaseId,
      name,
      created_at: now,
      updated_at: now,
    });

    this.triggerChange();

    return {
      createdAt: now,
      id,
      name,
      updatedAt: now,
    };
  }

  async removeNamespace(id: string): Promise<void> {
    await localDb.namespace.delete(id);
    await localDb.saved_doc.where({ namespace_id: id }).delete();
    this.triggerChange();
  }

  async updateNamespace(id: string, name: string): Promise<SavedDocNamespace> {
    const namespaceData = await localDb.namespace.get(id);
    if (!namespaceData) throw new Error("Namespace does not exist");

    const now = Math.floor(Date.now() / 1000);

    await localDb.namespace.update(id, {
      database_id: namespaceData.database_id,
      created_at: namespaceData.created_at,
      name,
      updated_at: now,
    });

    this.triggerChange();

    return {
      id,
      createdAt: namespaceData.created_at,
      name,
      updatedAt: now,
    };
  }

  async getNamespaces(): Promise<SavedDocNamespace[]> {
    const namespaceList = await localDb.namespace
      .where({
        database_id: this.databaseId,
      })
      .toArray();

    if (namespaceList.length === 0) {
      return [await this.createNamespace("Workplace")];
    }

    return namespaceList.map((n) => ({
      createdAt: n.created_at,
      id: n.id,
      name: n.name,
      updatedAt: n.updated_at,
    }));
  }

  async createDoc(
    type: SavedDocType,
    namespace: string,
    data: SavedDocInput
  ): Promise<SavedDocData> {
    const now = Math.floor(Date.now() / 1000);
    const id = generateId();

    const namespaceData = await localDb.namespace.get(namespace);
    if (!namespaceData) throw new Error("Namespace does not exist");

    await localDb.saved_doc.add({
      content: data.content,
      name: data.name,
      created_at: now,
      updated_at: now,
      database_id: this.databaseId,
      namespace_id: namespace,
      type,
      id,
    });

    this.triggerChange();

    return {
      content: data.content,
      createdAt: now,
      id,
      updatedAt: now,
      name: data.name,
      namespace: {
        id: namespace,
        name: namespaceData.name,
      },
      type,
    };
  }

  async removeDoc(id: string): Promise<void> {
    await localDb.saved_doc.delete(id);
    this.triggerChange();
  }

  async updateDoc(id: string, data: SavedDocInput): Promise<SavedDocData> {
    const doc = await localDb.saved_doc.get(id);
    if (!doc) throw new Error("Document does not exist");

    const namespaceData = await localDb.namespace.get(doc.namespace_id);
    if (!namespaceData) throw new Error("Namespace does not exist");

    const now = Math.floor(Date.now() / 1000);
    await localDb.saved_doc.update(id, {
      content: data.content,
      updated_at: now,
      created_at: doc.created_at,
      name: data.name,
      database_id: doc.database_id,
      namespace_id: doc.namespace_id,
      type: doc.type,
    });

    this.triggerChange();

    return {
      content: data.content,
      createdAt: doc.created_at,
      id,
      name: data.name,
      namespace: {
        id: namespaceData.id,
        name: namespaceData.name,
      },
      type: doc.type as SavedDocType,
      updatedAt: now,
    };
  }

  async getDocs(): Promise<SavedDocGroupByNamespace[]> {
    const ns = await this.getNamespaces();
    const docs = await localDb.saved_doc
      .where({ database_id: this.databaseId })
      .toArray();

    return ns.map((n) => {
      return {
        namespace: n,
        docs: docs
          .filter((d) => d.namespace_id === n.id)
          .map((d) => ({
            content: d.content,
            createdAt: d.created_at,
            id: d.id,
            name: d.name,
            namespace: {
              id: n.id ?? "",
              name: n.name ?? "",
            },
            type: d.type as SavedDocType,
            updatedAt: d.updated_at,
          })),
      };
    });
  }

  addChangeListener(cb: () => void): void {
    this.cb.push(cb);
  }

  removeChangeListener(cb: () => void): void {
    this.cb = this.cb.filter((c) => c !== cb);
  }

  protected triggerChange() {
    this.cb.forEach((c) => c());
  }
}
