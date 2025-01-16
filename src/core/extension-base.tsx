import { StudioExtensionContext } from "./extension-manager";

export abstract class IStudioExtension {
  abstract extensionName: string;
  abstract init(studio: StudioExtensionContext): void;
  abstract cleanup(): void;
}

export abstract class StudioExtension extends IStudioExtension {
  cleanup() {
    // Do nothing by default
  }
}
