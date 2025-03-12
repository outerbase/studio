import QueryWindow from "@/components/gui/tabs/query-tab";
import { generateId } from "@/lib/generate-id";
import { Binoculars } from "@phosphor-icons/react";
import { createTabExtension } from "../extension-tab";

let QUERY_COUNTER = 2;

export const builtinOpenQueryTab = createTabExtension<
  | {
      name?: string;
      saved?: {
        namespaceName?: string;
        key: string;
        sql: string;
      };
    }
  | undefined
>({
  name: "query",
  key: (options) => {
    if (options?.saved) {
      return options.saved.key;
    }
    return generateId();
  },
  generate: (options) => {
    const title = options?.saved
      ? (options.name ?? "Query")
      : "Query " + (QUERY_COUNTER++).toString();

    const component = options?.saved ? (
      <QueryWindow
        initialName={title}
        initialCode={options.saved.sql}
        initialSavedKey={options.saved.key}
        initialNamespace={options.saved.namespaceName}
      />
    ) : (
      <QueryWindow initialName={title} />
    );

    return {
      title: options?.name ?? "Query",
      component,
      icon: Binoculars,
    };
  },
});
