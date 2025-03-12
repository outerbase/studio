"use client";
import { generateId } from "@/lib/generate-id";
import {
  SavedDocData,
  SavedDocDriver,
  SavedDocGroupByNamespace,
  SavedDocInput,
  SavedDocNamespace,
  SavedDocType,
} from "./saved-doc-driver";

export default class ElectronSavedDocs implements SavedDocDriver {
  protected cb: (() => void)[] = [];
  protected cacheNamespaceList: SavedDocNamespace[] | null = null;
  protected cacheDocs: Record<string, SavedDocData[]> = {};

  async getNamespaces(): Promise<SavedDocNamespace[]> {
    if (this.cacheNamespaceList) {
      return this.cacheNamespaceList;
    }

    if (!window.outerbaseIpc?.docs) {
      throw new Error("Docs driver not found");
    }

    const result = await window.outerbaseIpc.docs.load();
    const now = Math.floor(Date.now() / 1000);

    if (!result || result.namespace.length === 0) {
      this.cacheNamespaceList = [
        { id: "workspace", name: "Workspace", createdAt: now, updatedAt: now },
      ];

      this.cacheDocs = {
        workspace: [],
      };

      return this.cacheNamespaceList;
    } else {
      this.cacheDocs = result.docs;
      this.cacheNamespaceList = result.namespace;
      return result.namespace;
    }
  }

  save() {
    if (!window.outerbaseIpc?.docs) {
      throw new Error("Docs driver not found");
    }

    window.outerbaseIpc.docs
      .save({
        namespace: this.cacheNamespaceList ?? [],
        docs: this.cacheDocs,
      })
      .then()
      .catch();
  }

  async createNamespace(name: string): Promise<SavedDocNamespace> {
    await this.getNamespaces();

    const now = Math.floor(Date.now() / 1000);
    const id = generateId();

    const namespace = {
      id,
      name,
      createdAt: now,
      updatedAt: now,
    };

    if (this.cacheNamespaceList) {
      this.cacheNamespaceList.push(namespace);
    }

    this.save();
    return namespace;
  }

  async updateNamespace(id: string, name: string): Promise<SavedDocNamespace> {
    await this.getNamespaces();

    const found = this.cacheNamespaceList?.find((n) => n.id === id);
    if (!found) {
      throw new Error("Namespace not found");
    }

    found.updatedAt = Math.floor(Date.now() / 1000);
    found.name = name;

    this.save();
    return found;
  }

  async removeNamespace(id: string): Promise<void> {
    await this.getNamespaces();

    this.cacheNamespaceList = (this.cacheNamespaceList ?? []).filter(
      (n) => n.id !== id
    );

    this.save();
  }

  async createDoc(
    type: SavedDocType,
    namespace: string,
    data: SavedDocInput
  ): Promise<SavedDocData> {
    await this.getNamespaces();

    const now = Math.floor(Date.now() / 1000);
    const r: SavedDocData = {
      content: data.content,
      name: data.name,
      createdAt: now,
      updatedAt: now,
      namespace: (this.cacheNamespaceList ?? []).find(
        (n) => n.id === namespace
      )!,
      type,
      id: generateId(),
    };

    if (this.cacheDocs[r.namespace.id]) {
      this.cacheDocs[r.namespace.id].unshift(r);
    } else {
      this.cacheDocs[r.namespace.id] = [r];
    }

    this.save();
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
    await this.getNamespaces();

    const r = Object.values(this.cacheDocs)
      .flat()
      .find((d) => d.id === id);
    if (!r) {
      throw new Error("Doc not found");
    }

    r.content = data.content;
    r.name = data.name;
    r.updatedAt = Math.floor(Date.now() / 1000);

    this.save();
    this.triggerChange();

    return r;
  }

  async removeDoc(id: string): Promise<void> {
    await this.getNamespaces();

    for (const namespaceId of Object.keys(this.cacheDocs)) {
      this.cacheDocs[namespaceId] = this.cacheDocs[namespaceId].filter(
        (d) => d.id !== id
      );
    }

    this.save();
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
