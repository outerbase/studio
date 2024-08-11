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
  SavedDocGroupByNamespace,
  SavedDocInput,
  SavedDocNamespace,
  SavedDocType,
} from "./saved-doc-driver";

export default class RemoteSavedDocDriver implements SavedDocDriver {
  protected databaseId: string;
  protected cb: (() => void)[] = [];
  protected cacheNamespaceList: SavedDocNamespace[] | null = null;
  protected cacheDocs: Record<string, SavedDocData[]> = {};

  constructor(databaseId: string) {
    this.databaseId = databaseId;
  }

  async getNamespaces(): Promise<SavedDocNamespace[]> {
    if (this.cacheNamespaceList) {
      return this.cacheNamespaceList;
    }

    const t = await getDocNamespaceList(this.databaseId);
    const d = await getSavedDocList(this.databaseId);

    this.cacheDocs = d.reduce(
      (a, b) => {
        if (!a[b.namespace.id]) a[b.namespace.id] = [b];
        else a[b.namespace.id].push(b);
        return a;
      },
      {} as Record<string, SavedDocData[]>
    );
    this.cacheNamespaceList = t;
    return t;
  }

  async createNamespace(name: string): Promise<SavedDocNamespace> {
    const t = await createDocNamespace(this.databaseId, name);

    if (this.cacheNamespaceList) {
      this.cacheNamespaceList.push(t);
    }

    return t;
  }

  async updateNamespace(id: string, name: string): Promise<SavedDocNamespace> {
    const t = await updateDocNamespace(this.databaseId, id, name);

    if (this.cacheNamespaceList) {
      this.cacheNamespaceList = this.cacheNamespaceList.map((n) => {
        if (n.id === t.id) {
          return t;
        }
        return n;
      });
    }

    return t;
  }

  async removeNamespapce(id: string): Promise<void> {
    await removeDocNamespace(this.databaseId, id);

    if (this.cacheNamespaceList) {
      this.cacheNamespaceList = this.cacheNamespaceList.filter(
        (n) => n.id !== id
      );

      if (this.cacheNamespaceList.length === 0) {
        this.cacheNamespaceList = null;
      }
    }
  }

  async createDoc(
    type: SavedDocType,
    namespace: string,
    data: SavedDocInput
  ): Promise<SavedDocData> {
    const r = await createSavedDoc(this.databaseId, namespace, type, data);

    if (this.cacheDocs[r.namespace.id]) {
      this.cacheDocs[r.namespace.id].unshift(r);
    }

    this.triggerChange();
    return r;
  }

  async getDocs(): Promise<SavedDocGroupByNamespace[]> {
    const ns = await this.getNamespaces();

    return ns.map((n) => {
      return {
        namespace: n,
        docs: this.cacheDocs[n.id] ?? [],
      };
    });
  }

  async updateDoc(id: string, data: SavedDocInput): Promise<SavedDocData> {
    const r = await updateSavedDoc(this.databaseId, id, data);

    if (this.cacheDocs[r.namespace.id]) {
      this.cacheDocs[r.namespace.id] = this.cacheDocs[r.namespace.id].map(
        (d) => {
          if (d.id === r.id) return r;
          return d;
        }
      );
    }

    this.triggerChange();
    return r;
  }

  async removeDoc(id: string): Promise<void> {
    const r = await removeSavedDoc(this.databaseId, id);

    for (const namespaceId of Object.keys(this.cacheDocs)) {
      this.cacheDocs[namespaceId] = this.cacheDocs[namespaceId].filter(
        (d) => d.id !== id
      );
    }

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
