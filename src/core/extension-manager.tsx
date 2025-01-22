import { ReactElement } from "react";
import { IStudioExtension } from "./extension-base";
import { DatabaseSchemaItem } from "@/drivers/base-driver";
import { BeforeQueryPipeline } from "./query-pipeline";

interface RegisterSidebarOption {
  key: string;
  name: string;
  icon: ReactElement;
  content: ReactElement;
}

type BeforeQueryHandler = (payload: BeforeQueryPipeline) => Promise<void>;
type AfterQueryHandler = () => Promise<void>;

export interface StudioExtensionMenuItem {
  key: string;
  title: string;
  icon?: ReactElement;
  onClick: () => void;
}

type CreateResourceMenuHandler = (
  resource: DatabaseSchemaItem
) => StudioExtensionMenuItem | undefined;
export class StudioExtensionContext {
  protected sidebars: RegisterSidebarOption[] = [];
  protected beforeQueryHandlers: BeforeQueryHandler[] = [];
  protected afterQueryHandlers: AfterQueryHandler[] = [];
  protected resourceCreateMenu: StudioExtensionMenuItem[] = [];
  protected resourceContextMenu: Record<string, CreateResourceMenuHandler[]> =
    {};

  constructor(protected extensions: IStudioExtension[]) {}

  registerBeforeQuery(handler: BeforeQueryHandler) {
    this.beforeQueryHandlers.push(handler);
  }

  registerAfterQuery(handler: AfterQueryHandler) {
    this.afterQueryHandlers.push(handler);
  }

  registerSidebar(option: RegisterSidebarOption) {
    this.sidebars.push(option);
  }

  registerCreateResourceMenu(menu: StudioExtensionMenuItem) {
    console.log("Register", menu);
    this.resourceCreateMenu.push(menu);
  }

  registerResourceContextMenu(
    handler: CreateResourceMenuHandler,
    group: "other" | "modification" = "other"
  ) {
    if (!this.resourceContextMenu[group]) {
      this.resourceContextMenu[group] = [handler];
    } else {
      this.resourceContextMenu[group].push(handler);
    }
  }
}
export class StudioExtensionManager extends StudioExtensionContext {
  init() {
    this.extensions.forEach((ext) => ext.init(this));
  }

  cleanup() {
    this.extensions.forEach((ext) => ext.cleanup());
  }

  getSidebars() {
    return this.sidebars;
  }

  getResourceCreateMenu() {
    return this.resourceCreateMenu;
  }

  getResourceContextMenu(
    resource: DatabaseSchemaItem,
    group: "other" | "modification"
  ) {
    return (this.resourceContextMenu[group] ?? [])
      .map((handler) => handler(resource))
      .filter(Boolean) as StudioExtensionMenuItem[];
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
