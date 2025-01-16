import { StudioExtension } from "@/core/extension-base";
import { StudioExtensionContext } from "@/core/extension-manager";

export default class QueryHistoryConsoleLogExtension extends StudioExtension {
  extensionName = "query-history-console-log";

  init(studio: StudioExtensionContext): void {
    studio.registerBeforeQuery(async (payload) => {
      const statements = payload.getStatments();

      if (statements.length === 1) {
        console.group("Query");
        console.info(`%c${statements[0]}`, "color:#e67e22");
        console.groupEnd();
      } else {
        console.group("Transaction");
        statements.forEach((s) => console.log(`%c${s}`, "color:#e67e22"));
        console.groupEnd();
      }
    });
  }
}
