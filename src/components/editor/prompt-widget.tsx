"use client";

import { cn } from "@/lib/utils";
import { X } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { Button } from "../orbit/button";

interface CodeMirrorPromptWidgetProps {
  onClose?: () => void;
}

export function CodeMirrorPromptWidget({}: CodeMirrorPromptWidgetProps) {
  const textareaClassName =
    "absolute left-0 right-0 resize-none p-1 p-2 outline-none";

  const fakeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [height, setHeight] = useState(60);
  const minHeight = 60;

  const handleResize = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (fakeTextareaRef.current && textareaRef.current) {
      fakeTextareaRef.current.value = e.currentTarget.value;
      const newHeight = Math.max(
        minHeight,
        fakeTextareaRef.current.scrollHeight
      );

      setHeight(Math.max(minHeight, fakeTextareaRef.current.scrollHeight));
      textareaRef.current.style.height = newHeight + "px";
    }
  };

  return (
    <div className="w-max-[500px] rounded border font-sans text-base">
      <div className="flex">
        <div
          className="relative flex-1 overflow-hidden"
          style={{ height: height + "px" }}
        >
          <textarea
            ref={fakeTextareaRef}
            className={cn(textareaClassName, "invisible")}
            style={{ height: "1px" }}
          />
          <textarea
            ref={textareaRef}
            autoFocus
            className={cn(textareaClassName, "top-0 bottom-0 overflow-hidden")}
            onKeyUp={(e) => {
              handleResize(e);
              e.stopPropagation();
            }}
          />
        </div>
        <div>
          <button className="p-2">
            <X weight="bold" />
          </button>
        </div>
      </div>
      <div className="flex gap-1 p-2">
        <Button variant="primary">⌘↵ Submit Edit</Button>
        <Button variant="ghost">⌘⌫ Reject</Button>
      </div>
    </div>
  );
}
