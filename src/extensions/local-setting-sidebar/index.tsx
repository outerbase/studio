import { localSettingDialog } from "@/app/(outerbase)/local-setting-dialog";
import { StudioExtension } from "@/core/extension-base";
import { StudioExtensionContext } from "@/core/extension-manager";
import { MagicWand } from "@phosphor-icons/react";

export default class LocalSettingSidebar extends StudioExtension {
  extensionName = "local-setting-sidebar";

  init(studio: StudioExtensionContext): void {
    studio.registerSidebar({
      key: "local-setting-sidebar",
      name: "Local Settings",
      icon: <MagicWand size={24} />,
      onClick: () => {
        localSettingDialog.show({}).then().catch();
      },
    });
  }
}
