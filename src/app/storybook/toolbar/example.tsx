import {
  Toolbar,
  ToolbarButton,
  ToolbarFiller,
  ToolbarSeparator,
} from "@/components/gui/toolbar";
import { LucideCopy, LucideFolder, LucideSave } from "lucide-react";

export function StorybookToolbarExample() {
  return (
    <div className="flex h-[300px] max-w-[800px] flex-col border">
      <div className="border-b p-1">
        <Toolbar>
          <ToolbarButton
            text="Save"
            icon={<LucideSave className="h-4 w-4" />}
          />
          <ToolbarButton
            text="Open"
            icon={<LucideFolder className="h-4 w-4" />}
          />
          <ToolbarSeparator />
          <ToolbarButton
            text="Copy"
            icon={<LucideCopy className="h-4 w-4" />}
          />
          <ToolbarFiller />
          <ToolbarButton text="Remove" destructive />
        </Toolbar>
      </div>
      <div className="bg-secondary flex-1"></div>
    </div>
  );
}
