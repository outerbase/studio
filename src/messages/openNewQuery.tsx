import { openTabs } from "./openTabs";

let QUERY_COUNTER = 1;

export default function openNewQuery() {
  openTabs({
    key: "__query_" + QUERY_COUNTER++,
    type: "query",
    name: "Query",
  });
}
