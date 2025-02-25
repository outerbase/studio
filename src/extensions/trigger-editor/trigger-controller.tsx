import CodePreview from "@/components/gui/code-preview";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { LucideCode, LucideLoader, LucideSave } from "lucide-react";

interface Props {
  onSave: () => void;
  onDiscard: () => void;
  previewScript: string;
  isExecuting?: boolean;
  disabled?: boolean;
}

export function TriggerController(props: Props) {
  const { onSave, onDiscard, isExecuting, disabled, previewScript } = props;
  return (
    <div className="flex gap-2 p-1">
      <Button variant="ghost" onClick={onSave} disabled={disabled} size={"sm"}>
        {isExecuting ? (
          <LucideLoader className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LucideSave className="mr-2 h-4 w-4" />
        )}
        Save
      </Button>
      <Button
        size={"sm"}
        variant="ghost"
        onClick={onDiscard}
        disabled={disabled}
        className="text-red-500"
      >
        Discard Change
      </Button>

      <div>
        <Separator orientation="vertical" />
      </div>

      <Popover>
        <PopoverTrigger>
          <div className={buttonVariants({ size: "sm", variant: "ghost" })}>
            <LucideCode className="mr-1 h-4 w-4" />
            SQL Preview
          </div>
        </PopoverTrigger>
        <PopoverContent style={{ width: 500 }}>
          <div className="mb-1 text-sm font-semibold">SQL Preview</div>
          <div style={{ maxHeight: 400 }} className="overflow-y-auto">
            <CodePreview code={previewScript} />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
