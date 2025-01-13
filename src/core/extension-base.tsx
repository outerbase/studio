import { StudioExtensionManager } from "./extension-manager";

export abstract class IStudioExtension {
  abstract extensionName: string;
  abstract init(studio: StudioExtensionManager): void;
  abstract cleanup(): void;
}

export abstract class StudioExtension extends IStudioExtension {
  cleanup() {
    // Do nothing by default
  }
}
