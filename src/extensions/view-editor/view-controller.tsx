import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { LucideCode, LucideLoader, LucideSave } from "lucide-react";
import React from "react";
import CodePreview from "../../components/gui/code-preview";

interface Props {
  onSave: () => void;
  onDiscard: () => void;
  previewScript: string;
  isExecuting?: boolean;
  disabled?: boolean;
}

export function ViewController(props: Props) {
  const { onSave, onDiscard, isExecuting, disabled, previewScript } = props;
  return (
    <div className="p-1 flex gap-2">
      <Button variant="ghost" onClick={onSave} disabled={disabled} size={"sm"}>
        {isExecuting ? (
          <LucideLoader className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <LucideSave className="w-4 h-4 mr-2" />
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
            <LucideCode className="w-4 h-4 mr-1" />
            SQL Preview
          </div>
        </PopoverTrigger>
        <PopoverContent style={{ width: 500 }}>
          <div className="text-xs font-semibold mb-1">SQL Preview</div>
          <div style={{ maxHeight: 400 }} className="overflow-y-auto">
            <CodePreview code={previewScript} />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
