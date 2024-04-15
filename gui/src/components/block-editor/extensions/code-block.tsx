import { Button } from "@gui/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@gui/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@gui/components/ui/popover";
import { cn, scoped } from "@gui/lib/utils";
import { createReactBlockSpec } from "../utils/create-block-spec";
import ReactCodeMirror from "@uiw/react-codemirror";
import { Check, ChevronsUpDown } from "lucide-react";
import { langs, type LanguageName } from "@uiw/codemirror-extensions-langs";
import { useState } from "react";
import { InputRule } from "@tiptap/core";

export const CodeBlock = createReactBlockSpec(
  {
    type: "codeBlock",
    content: "none",
    propSchema: {
      language: {
        default: "plaintext",
      },
      code: {
        default: "",
      },
    },
  },
  {
    addInputRules: () => [
      new InputRule({
        find: /^```([a-zA-Z0-9]+)?\n$/,
        handler: ({ state, match, chain }) => {
          const supposeLanguage = match[1];
          const language = langs[supposeLanguage as LanguageName]
            ? supposeLanguage
            : "plaintext";
          const code = "";

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (chain() as any).BNUpdateBlock(state.selection.from, {
            type: "codeBlock",
            props: { language, code },
          });
        },
      }),
    ],
    render: ({ block, editor }) => {
      const extensions = scoped(() => {
        const lang = langs[block.props.language as LanguageName];
        if (!lang) return [];
        return [lang()];
      });

      return (
        <div className="relative rounded-md border min-h-40 flex">
          <div className="absolute group flex z-10 top-3 right-3">
            <LanguageSelector
              value={block.props.language}
              onValueChange={(value) => {
                editor.updateBlock(block, {
                  props: { ...block.props, language: value },
                });
              }}
            />
          </div>
          <ReactCodeMirror
            className="flex-1 flex p-3 [&>.cm-editor]:!outline-none *:!font-mono"
            value={block.props.code}
            autoFocus
            width="100%"
            height="100%"
            basicSetup={{
              lineNumbers: false,
              foldGutter: false,
              highlightActiveLine: false,
              tabSize: 2,
              indentOnInput: true,
              autocompletion: false,
            }}
            onChange={(value) => {
              editor.updateBlock(block, {
                props: { ...block.props, code: value },
              });
            }}
            extensions={extensions}
          />
        </div>
      );
    },
  }
);

interface LanguageSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

function LanguageSelector({ value, onValueChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="justify-between"
          size="sm"
        >
          {value || "Select framework..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[168px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup className="max-h-72 overflow-y-auto">
            {["plaintext", ...Object.keys(langs)].map((lang) => (
              <CommandItem
                key={lang}
                value={lang}
                onSelect={(value) => {
                  onValueChange(value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === lang ? "opacity-100" : "opacity-0"
                  )}
                />
                {lang}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
