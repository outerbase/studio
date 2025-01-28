import { OptimizeTableHeaderProps } from "@/components/gui/table-optimized";
import { DatabaseSchemaItem } from "@/drivers/base-driver";
import { ReactElement } from "react";
import { IStudioExtension } from "./extension-base";
import { BeforeQueryPipeline } from "./query-pipeline";

interface RegisterSidebarOption {
  key: string;
  name: string;
  icon: ReactElement;
  content?: ReactElement;
  onClick?: () => void;
}

type BeforeQueryHandler = (payload: BeforeQueryPipeline) => Promise<void>;
type AfterQueryHandler = () => Promise<void>;

export interface StudioExtensionMenuItem {
  key: string;
  title: string;
  icon?: ReactElement;
  onClick?: () => void;
  component?: ReactElement;
}

type CreateResourceMenuHandler = (
  resource: DatabaseSchemaItem
) => StudioExtensionMenuItem | undefined;

type QueryHeaderResultMenuHandler = (
  header: OptimizeTableHeaderProps
) => StudioExtensionMenuItem | undefined;

type QueryResultCellMenuHandler = () => StudioExtensionMenuItem | undefined;

export class StudioExtensionContext {
  protected sidebars: RegisterSidebarOption[] = [];

  protected beforeQueryHandlers: BeforeQueryHandler[] = [];
  protected afterQueryHandlers: AfterQueryHandler[] = [];

  protected queryResultHeaderContextMenu: QueryHeaderResultMenuHandler[] = [];
  protected queryResultCellContextMenu: QueryResultCellMenuHandler[] = [];

  protected resourceCreateMenu: StudioExtensionMenuItem[] = [];
  protected resourceContextMenu: Record<string, CreateResourceMenuHandler[]> =
    {};

  constructor(protected extensions: IStudioExtension[]) {
    this.extensions.forEach((ext) => ext.init(this));
  }

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

  registerQueryHeaderContextMenu(handler: QueryHeaderResultMenuHandler) {
    this.queryResultHeaderContextMenu.push(handler);
  }

  registerQueryCellContextMenu(handler: QueryResultCellMenuHandler) {
    this.queryResultCellContextMenu.push(handler);
  }
}
export class StudioExtensionManager extends StudioExtensionContext {
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

  getQueryHeaderContextMenu(header: OptimizeTableHeaderProps) {
    return this.queryResultHeaderContextMenu
      .map((handler) => handler(header))
      .filter(Boolean) as StudioExtensionMenuItem[];
  }

  getQueryCellContextMenu() {
    return this.queryResultCellContextMenu
      .map((handler) => handler())
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
