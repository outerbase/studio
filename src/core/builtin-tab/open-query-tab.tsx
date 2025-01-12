import QueryWindow from "@/components/gui/tabs/query-tab";
import { TAB_PREFIX_SAVED_QUERY } from "@/const";
import { Binoculars } from "@phosphor-icons/react";
import openUnsafeTab from "./open-tab";

let QUERY_COUNTER = 2;

export default function builtinOpenQueryTab(payload: {
  name?: string;
  saved?: {
    namespaceName?: string;
    key: string;
    sql: string;
  };
}) {
  const title = payload.saved
    ? payload.name ?? "Query"
    : "Query " + (QUERY_COUNTER++).toString();

  const key = payload.saved
    ? TAB_PREFIX_SAVED_QUERY + payload.saved.key
    : "query-" + window.crypto.randomUUID();

  const component = payload.saved ? (
    <QueryWindow
      initialName={title}
      initialCode={payload.saved.sql}
      initialSavedKey={payload.saved.key}
      initialNamespace={payload.saved.namespaceName}
    />
  ) : (
    <QueryWindow initialName={title} />
  );

  return openUnsafeTab({
    title: payload.name ?? "Query",
    identifier: "query",
    key,
    component,
    icon: Binoculars,
    type: "query",
  });
}
