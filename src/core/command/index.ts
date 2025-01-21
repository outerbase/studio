/**
 * scc stands for Studio Core Command. It is a collection of commands that are
 * available to Outerbase Studio.
 */

import { builtinOpenERDTab } from "../builtin-tab/open-erd-tab";
import { builtinMassDropTableTab } from "../builtin-tab/open-mass-drop-table";
import { builtinOpenQueryTab } from "../builtin-tab/open-query-tab";
import { builtinOpenSchemaTab } from "../builtin-tab/open-schema-tab";
import { builtinOpenTableTab } from "../builtin-tab/open-table-tab";
import { tabCloseChannel } from "../extension-tab";

export const scc = {
  tabs: {
    openBuiltinQuery: builtinOpenQueryTab.open,
    openBuiltinTable: builtinOpenTableTab.open,
    openBuiltinSchema: builtinOpenSchemaTab.open,
    openBuiltinERD: builtinOpenERDTab.open,
    openBuiltinMassDropTable: builtinMassDropTableTab.open,

    close: (keys: string[]) => {
      tabCloseChannel.send(keys);
    },
  },
};
