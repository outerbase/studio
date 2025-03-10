"use client";

import AgentDriverList from "@/drivers/agent/list";
import { cn } from "@/lib/utils";
import { Check, X } from "@phosphor-icons/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { CloudflareIcon } from "../icons/outerbase-icon";
import { Button } from "../orbit/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface CodeMirrorPromptWidgetProps {
  agentDriver?: AgentDriverList;
  onClose?: () => void;
  onCancel?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onSubmit?: (query: string, selectedModel?: string) => Promise<void>;
}

export function CodeMirrorPromptWidget({
  onClose,
  onCancel,
  onSubmit,
  onAccept,
  onReject,
  agentDriver,
}: CodeMirrorPromptWidgetProps) {
  const textareaClassName =
    "absolute left-0 right-0 resize-none p-1 p-2 outline-none";

  const fakeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const agentList = useMemo(() => {
    if (!agentDriver) return [];
    return agentDriver.list();
  }, [agentDriver]);
  const [selectedAgent, setSelectedAgent] = useState(() =>
    agentDriver?.getDefaultModelName()
  );

  const [previousPrompt, setPreviousPrompt] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [height, setHeight] = useState(60);
  const [prompt, setPrompt] = useState("");
  const cancelTriggered = useRef(false);

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

  const showSubmitButton = !previousPrompt && prompt;
  const showSubmitEditButton = previousPrompt && previousPrompt !== prompt;
  const showAcceptButton = prompt === previousPrompt && previousPrompt;

  const triggerSubmit = useCallback(() => {
    if (onSubmit) {
      setLoading(true);
      setError("");
      cancelTriggered.current = false;

      onSubmit(prompt, selectedAgent)
        .then(() => {
          if (!cancelTriggered.current) {
            setPreviousPrompt(prompt);
          }
        })
        .catch((e) => {
          if (!cancelTriggered.current) {
            if (e instanceof Error) {
              setError(e.message);
            }

            setError(e.toString());
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [onSubmit, prompt, selectedAgent]);

  const triggerReject = useCallback(() => {
    if (onReject) onReject();
    setPreviousPrompt("");
  }, [onReject]);

  const triggerCancel = useCallback(() => {
    if (onCancel) onCancel();
    cancelTriggered.current = true;
    setLoading(false);
  }, [onCancel]);

  const onKeydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      if (showAcceptButton) {
        if (onAccept) onAccept();
      } else if (showSubmitEditButton) {
        if (onSubmit) triggerSubmit();
      }
      e.preventDefault();
    } else if (!e.shiftKey && e.key === "Enter") {
      if (showSubmitButton) {
        if (onSubmit) triggerSubmit();
      }
      e.preventDefault();
    } else if (e.key === "Escape") {
      if (onClose) onClose();
      e.preventDefault();
    } else if ((e.metaKey || e.ctrlKey) && e.key === "Backspace") {
      if (loading) {
        if (onCancel) triggerCancel();
      } else {
        if (onReject) triggerReject();
      }
      e.preventDefault();
    }

    e.stopPropagation();
  };

  return (
    <div className="max-w-[500px] rounded border font-sans text-base">
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
            placeholder="Editing instruction"
            autoFocus
            className={cn(
              textareaClassName,
              "text-foreground top-0 bottom-0 overflow-hidden"
            )}
            onPaste={(e) => {
              e.stopPropagation();
            }}
            onCopy={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) => {
              setPrompt(e.currentTarget.value);
            }}
            value={prompt}
            onKeyDown={onKeydown}
            onKeyUp={(e) => {
              handleResize(e);
              e.stopPropagation();
            }}
          />
        </div>
        <div>
          <button className="cursor-pointer p-2" onClick={onClose}>
            <X weight="bold" />
          </button>
        </div>
      </div>

      {error && (
        <div className="line-clamp-1 p-2 text-sm text-red-500">
          {error.split("\n")[0]}
        </div>
      )}

      <div className="flex h-10 items-center gap-1 p-2">
        {(showSubmitButton || showSubmitEditButton) && (
          <Button
            variant="primary"
            size="sm"
            loading={loading}
            onClick={triggerSubmit}
          >
            {previousPrompt ? "⌘↵ Submit Edit" : "⌘ Submit"}
          </Button>
        )}

        {showAcceptButton && (
          <Button variant="primary" size="sm" onClick={onAccept}>
            Accept
          </Button>
        )}

        {previousPrompt && !loading && (
          <Button variant="ghost" size="sm" onClick={triggerReject}>
            ⌘⌫ Reject
          </Button>
        )}

        {loading && (
          <Button variant="ghost" size="sm" onClick={triggerCancel}>
            ⌘⌫ Cancel
          </Button>
        )}

        <div className="flex-1" />

        {agentList.length > 0 && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {selectedAgent !== "gpt-4o mini" && (
                  <CloudflareIcon className="inline-flex h-4 w-4 text-orange-500" />
                )}
                {selectedAgent}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
              {agentList.map((group) => (
                <DropdownMenuGroup key={group.name}>
                  <DropdownMenuLabel>{group.title}</DropdownMenuLabel>
                  {group.agents.map((agent) => (
                    <DropdownMenuItem
                      disabled={!agent.available}
                      inset={selectedAgent !== agent.name}
                      key={agent.name}
                      onClick={() => {
                        setSelectedAgent(agent.name);
                        if (agentDriver) {
                          agentDriver.setDefaultModelName(agent.name);
                        }
                      }}
                    >
                      {agent.name === selectedAgent ? (
                        <Check className="mr-2 h-4 w-4" />
                      ) : null}
                      {agent.name}
                      {agent.free ? (
                        <div className="flex flex-1 justify-end">
                          <span className="bg-secondary text-secondary-foreground rounded px-2 text-sm">
                            free tier
                          </span>
                        </div>
                      ) : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {!previousPrompt && !loading ? (
          <span className="text-muted-foreground ml-2 text-sm">
            Esc to close
          </span>
        ) : null}
      </div>
    </div>
  );
}
