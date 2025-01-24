import { DoltIcon } from "@/components/icons/outerbase-icon";
import { StudioExtension } from "@/core/extension-base";
import { StudioExtensionContext } from "@/core/extension-manager";
import DoltSidebar from "./dolt-sidebar";
import { Table } from "lucide-react";
import { createTabExtension } from "@/core/extension-tab";

export const doltCommitTab = createTabExtension<{
  commitHash: string;
  commitMessage: string;
}>({
  name: "dolt-commit",
  key: (options) => options?.commitHash ?? "",
  generate: (options) => ({
    title: "Commit " + options?.commitMessage,
    icon: Table,
    component: <div>Testing</div>,
  }),
});

export default class DoltExtension extends StudioExtension {
  extensionName = "dolt";

  init(studio: StudioExtensionContext): void {
    studio.registerSidebar({
      key: "dolt",
      name: "Dolt",
      icon: <DoltIcon className="w-7 h-7 text-green-500" />,
      content: <DoltSidebar />,
    });
  }
}
