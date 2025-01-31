import { ChartLine, ImageUpscale } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface Props {
  editMode: "ADD_CHART" | "REARRANGING_CHART" | null;
  setEditMode: (v: "ADD_CHART" | "REARRANGING_CHART") => void;
}

export function BoardTool(props: Props) {
  return (
    <div className="bg-secondary absolute bottom-0 left-1/2 flex -translate-x-1/2 -translate-y-1/2 transform rounded-md p-1 shadow dark:bg-white">
      <ToggleGroup
        type="single"
        size={"sm"}
        value={props.editMode as string}
        onValueChange={props.setEditMode}
      >
        <ToggleGroupItem value="ADD_CHART">
          <Tooltip>
            <TooltipTrigger>
              <ChartLine className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>Add Chart</TooltipContent>
          </Tooltip>
        </ToggleGroupItem>
        <ToggleGroupItem value="REARRANGING_CHART">
          <Tooltip>
            <TooltipTrigger>
              <ImageUpscale className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>Rearranging charts</TooltipContent>
          </Tooltip>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
