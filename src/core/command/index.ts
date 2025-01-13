/**
 * scc stands for Studio Core Command. It is a collection of commands that are
 * available to Outerbase Studio.
 */

import { builtinOpenERDTab } from "../builtin-tab/open-erd-tab";
import { builtinMassDropTableTab } from "../builtin-tab/open-mass-drop-table";
import { builtinOpenQueryTab } from "../builtin-tab/open-query-tab";
import { builtinOpenSchemaTab } from "../builtin-tab/open-schema-tab";
import { builtinOpenTableTab } from "../builtin-tab/open-table-tab";
import { builtinOpenTriggerTab } from "../builtin-tab/open-trigger-tab";
import { buildinOpenViewTab } from "../builtin-tab/open-view-tab";

export const scc = {
  tabs: {
    openBuiltinQuery: builtinOpenQueryTab.open,
    openBuiltinTable: builtinOpenTableTab.open,
    openBuiltinSchema: builtinOpenSchemaTab.open,
    openBuiltinTrigger: builtinOpenTriggerTab.open,
    openBuiltinERD: builtinOpenERDTab.open,
    openBuiltinMassDropTable: builtinMassDropTableTab.open,
    openBuildinView: buildinOpenViewTab.open,

    close: (keys: string[]) => {
      if (window.outerbaseCloseTab) {
        window.outerbaseCloseTab(keys);
      }
    },
  },
};
