import {
  createDocNamespace,
  getDocNamespaceList,
  removeDocNamespace,
  updateDocNamespace,
  getSavedDocList,
  createSavedDoc,
  removeSavedDoc,
  updateSavedDoc,
} from "./saved-doc-actions";
import {
  SavedDocData,
  SavedDocDriver,
  SavedDocInput,
  SavedDocNamespace,
  SavedDocType,
} from "./saved-doc-driver";

export default class RemoteSavedDocDriver implements SavedDocDriver {
  protected databaseId: string;
  protected cb: (() => void)[] = [];

  constructor(databaseId: string) {
    this.databaseId = databaseId;
  }

  getNamespaces(): Promise<SavedDocNamespace[]> {
    return getDocNamespaceList(this.databaseId);
  }

  createNamespace(name: string): Promise<SavedDocNamespace> {
    return createDocNamespace(this.databaseId, name);
  }

  updateNamespace(id: string, name: string): Promise<SavedDocNamespace> {
    return updateDocNamespace(this.databaseId, id, name);
  }

  removeNamespapce(id: string): Promise<void> {
    return removeDocNamespace(this.databaseId, id);
  }

  async createDoc(
    type: SavedDocType,
    namespace: string,
    data: SavedDocInput
  ): Promise<SavedDocData> {
    const r = await createSavedDoc(this.databaseId, namespace, type, data);
    this.triggerChange();
    return r;
  }

  getDocs(namespaceId: string): Promise<SavedDocData[]> {
    return getSavedDocList(this.databaseId, namespaceId);
  }

  async updateDoc(id: string, data: SavedDocInput): Promise<SavedDocData> {
    const r = updateSavedDoc(this.databaseId, id, data);
    this.triggerChange();
    return r;
  }

  async removeDoc(id: string): Promise<void> {
    const r = await removeSavedDoc(this.databaseId, id);
    this.triggerChange();
    return r;
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
