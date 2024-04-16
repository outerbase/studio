import OptimizeTableState from "./components/table-optimized/OptimizeTableState";
import { StudioContextMenuItem } from "./messages/open-context-menu";

export interface StudioExtension {
  contextMenu?: (state: OptimizeTableState) => StudioContextMenuItem[];
}
