import { StudioExtension } from "@/core/extension-base";
import { StudioExtensionContext } from "@/core/extension-manager";
import { DecoratorEditor } from "./editor";

export default class DataDecoratorExtension extends StudioExtension {
  extensionName = "data-decorator";

  init(studio: StudioExtensionContext): void {
    studio.registerQueryHeaderContextMenu((header, state) => {
      return {
        key: "data-decorator",
        title: "Decorate",
        component: <DecoratorEditor header={header} state={state} />,
      };
    });
  }
}
