import { StudioExtension } from "@/core/extension-base";
import { StudioExtensionContext } from "@/core/extension-manager";

export default class ForeignKeyColumnExtension extends StudioExtension {
  extensionName = "foreign-key-column";

  init(studio: StudioExtensionContext) {
    studio.registerQueryHeaderContextMenu((header) => {
      console.log(header);
      if (!header.metadata.referenceTo) return;

      return {
        key: "foreign-key-indicator",
        title: "",
        component: (
          <div className="p-2">
            <div className="rounded bg-yellow-200 p-2 text-xs text-black">
              <h2 className="font-semibold">Foreign Key</h2>
              <p className="mt-1 font-mono">
                {header.metadata.referenceTo.table}.
                {header.metadata.referenceTo.column}
              </p>
            </div>
          </div>
        ),
      };
    });
  }
}
