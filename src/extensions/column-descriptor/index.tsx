import { StudioExtension } from "@/core/extension-base";
import { StudioExtensionContext } from "@/core/extension-manager";

export default class ColumnDescriptorExtension extends StudioExtension {
  extensionName = "column-descriptor";

  init(studio: StudioExtensionContext) {
    studio.registerQueryHeaderContextMenu((header) => {
      if (!header.metadata.referenceTo) return;

      return {
        key: "foreign-key-indicator",
        title: "",
        component: (
          <div className="p-2">
            <div className="rounded bg-yellow-200 p-2 text-sm text-black">
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

    studio.registerQueryHeaderContextMenu((header) => {
      const generatedExpression =
        header.metadata?.columnSchema?.constraint?.generatedExpression;

      if (!generatedExpression) return;

      const generatedInfo = generatedExpression ? (
        <div className="p-2">
          <div className="rounded bg-blue-200 p-2 text-sm text-black">
            <h2 className="font-semibold">Generated Expression</h2>
            <pre className="text-sm">
              <code>{generatedExpression}</code>
            </pre>
          </div>
        </div>
      ) : undefined;

      return {
        key: "generated-expression",
        title: "",
        component: generatedInfo,
      };
    });
  }
}
