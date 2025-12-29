import DumpDatabaseTab from "@/components/gui/tabs/dump-database-tab";
import { DownloadSimple } from "@phosphor-icons/react";
import { createTabExtension } from "../extension-tab";

export const builtinOpenDumpDatabaseTab = createTabExtension({
  name: "dump-database",
  key: () => "",
  generate: () => ({
    title: "Dump Database",
    component: <DumpDatabaseTab />,
    icon: DownloadSimple,
  }),
});
