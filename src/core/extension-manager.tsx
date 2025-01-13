import { ReactElement } from "react";
import { IStudioExtension } from "./extension-base";

interface RegisterSidebarOption {
  key: string;
  name: string;
  icon: ReactElement;
  content: ReactElement;
}

export class BeforeQueryPipeline {
  tags = new Set<string>();

  constructor(
    protected type: "query" | "transaction",
    protected statements: string[]
  ) {}

  addTag(tag: string) {
    this.tags.add(tag);
  }

  removeTab(tag: string) {
    this.tags.delete(tag);
  }

  getTags() {
    return this.tags.values();
  }

  hasTag(tag: string) {
    return this.tags.has(tag);
  }

  getStatments() {
    return this.statements;
  }

  updateStatements(statements: string[]) {
    this.statements = statements;
  }

  getType() {
    return this.type;
  }
}

type BeforeQueryHandler = (payload: BeforeQueryPipeline) => Promise<void>;
type AfterQueryHandler = () => Promise<void>;
export class StudioExtensionManager {
  private sidebars: RegisterSidebarOption[] = [];
  private beforeQueryHandlers: BeforeQueryHandler[] = [];
  private afterQueryHandlers: AfterQueryHandler[] = [];

  constructor(private extensions: IStudioExtension[]) {}

  init() {
    this.extensions.forEach((ext) => ext.init(this));
  }

  cleanup() {
    this.extensions.forEach((ext) => ext.cleanup());
  }

  registerSidebar(option: RegisterSidebarOption) {
    this.sidebars.push(option);
  }

  getSidebars() {
    return this.sidebars;
  }

  registerBeforeQuery(handler: BeforeQueryHandler) {
    this.beforeQueryHandlers.push(handler);
  }

  registerAfterQuery(handler: AfterQueryHandler) {
    this.afterQueryHandlers.push(handler);
  }

  async beforeQuery(payload: BeforeQueryPipeline) {
    for (const handler of this.beforeQueryHandlers) {
      await handler(payload);
    }
  }

  async afterQuery() {
    for (const handler of this.afterQueryHandlers) {
      await handler();
    }
  }
}
