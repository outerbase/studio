import {
  SavedDocData,
  SavedDocDriver,
  SavedDocGroupByNamespace,
  SavedDocInput,
  SavedDocNamespace,
  SavedDocType,
} from "@/drivers/saved-doc/saved-doc-driver";
import {
  createOuterbaseQuery,
  deleteOuterbaseQuery,
  getOuterbaseQueryList,
  updateOuterbaseQuery,
} from "./api";

export default class OuterbaseQueryDriver implements SavedDocDriver {
  protected cb: (() => void)[] = [];
  protected cacheNamespaceList: SavedDocNamespace[] | null = null;
  protected cacheDocs: Record<string, SavedDocData[]> = {};

  constructor(
    protected workspaceId: string,
    protected baseId: string,
    protected sourceId: string
  ) {}

  async getNamespaces(): Promise<SavedDocNamespace[]> {
    if (this.cacheNamespaceList) {
      return this.cacheNamespaceList;
    }

    const queries = await getOuterbaseQueryList(this.workspaceId, this.baseId);

    this.cacheNamespaceList = [
      {
        id: "default",
        name: "Workspace",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    this.cacheDocs = {
      default: queries.items.map((q) => ({
        id: q.id,
        namespace: {
          id: "default",
          name: "Workspace",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        name: q.name,
        content: q.query,
        type: "sql",
        data: q,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })),
    };

    return this.cacheNamespaceList;
  }

  async createNamespace(): Promise<SavedDocNamespace> {
    throw new Error("Not implemented");
  }

  async updateNamespace(): Promise<SavedDocNamespace> {
    throw new Error("Not implemented");
  }

  async removeNamespace(): Promise<void> {
    throw new Error("Not implemented");
  }

  async createDoc(
    _: SavedDocType,
    __: string,
    data: SavedDocInput
  ): Promise<SavedDocData> {
    await this.getNamespaces();

    const r = await createOuterbaseQuery(this.workspaceId, this.baseId, {
      baseId: this.baseId,
      name: data.name,
      query: data.content,
      source_id: this.sourceId,
    });

    const doc: SavedDocData = {
      id: r.id,
      namespace: {
        id: "default",
        name: "Workspace",
      },
      name: data.name,
      content: data.content,
      type: "sql",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (this.cacheDocs["default"]) {
      this.cacheDocs["default"].unshift(doc);
    }

    this.triggerChange();
    return doc;
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
    await this.getNamespaces();

    const r = await updateOuterbaseQuery(this.workspaceId, id, {
      name: data.name,
      query: data.content,
    });

    const doc: SavedDocData = {
      id: r.id,
      namespace: {
        id: "default",
        name: "Workspace",
      },
      name: r.name,
      content: r.query,
      type: "sql",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (this.cacheDocs["default"]) {
      this.cacheDocs["default"] = this.cacheDocs["default"].map((d) => {
        if (d.id === r.id) return doc;
        return d;
      });
    }

    this.triggerChange();
    return doc;
  }

  async removeDoc(id: string): Promise<void> {
    await this.getNamespaces();
    await deleteOuterbaseQuery(this.workspaceId, id);

    for (const namespaceId of Object.keys(this.cacheDocs)) {
      this.cacheDocs[namespaceId] = this.cacheDocs[namespaceId].filter(
        (d) => d.id !== id
      );
    }

    this.triggerChange();
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
