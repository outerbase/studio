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
  protected currentNamespace: string = "";

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

  createDoc(
    type: SavedDocType,
    namespace: string,
    data: SavedDocInput
  ): Promise<SavedDocData> {
    return createSavedDoc(this.databaseId, namespace, type, data);
  }

  getDocs(namespaceId: string): Promise<SavedDocData[]> {
    return getSavedDocList(this.databaseId, namespaceId);
  }

  updateDoc(id: string, data: SavedDocInput): Promise<SavedDocData> {
    return updateSavedDoc(this.databaseId, id, data);
  }

  removeDoc(id: string): Promise<void> {
    return removeSavedDoc(this.databaseId, id);
  }

  setCurrentNamespace(id: string) {
    this.currentNamespace = id;
  }

  getCurrentNamespace(): string {
    return this.currentNamespace;
  }
}
