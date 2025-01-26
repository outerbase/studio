import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  createContext,
  Fragment,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import JsonEditor from "../json-editor";
import { noop } from "lodash";

interface FullEditorContextValue {
  openEditor: (option: FullEditorOption) => void;
  closeEditor: () => void;
}

interface FullEditorOption {
  initialValue: string;
  format: string;
  readOnly?: boolean;
  onSave: (value: string) => void;
  onCancel: () => void;
}

const FullEditorContext = createContext<FullEditorContextValue>({
  openEditor: noop,
  closeEditor: noop,
});

function FullEditorSheet({ option }: { option: FullEditorOption }) {
  const [value, setValue] = useState(() => {
    if (option.format === "json") {
      try {
        return JSON.stringify(JSON.parse(option.initialValue), undefined, 2);
      } catch {
        return option.initialValue;
      }
    }

    return option.initialValue;
  });

  return (
    <Sheet open>
      <SheetContent
        hideCloseButton
        className="border-none sm:max-w-[1000px] sm:w-[70vw] overflow-hidden flex p-0"
      >
        <div className="flex flex-col grow overflow-hidden">
          <div className="p-4 flex gap-2">
            <div className="grow" />
            <Button onClick={option.onCancel} variant={"destructive"}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (option.format === "json") {
                  try {
                    option.onSave(JSON.stringify(JSON.parse(value)));
                  } catch {
                    option.onSave(value);
                  }
                } else {
                  option.onSave(value);
                }
              }}
            >
              Save Change
            </Button>
          </div>
          <Separator />

          {option.format === "text" && (
            <textarea
              autoFocus
              className="grow p-4 w-full outline-hidden bg-inherit font-mono"
              value={value}
              onChange={(e) => setValue(e.currentTarget.value)}
              readOnly={option.readOnly}
            />
          )}

          {option.format === "json" && (
            <div className="grow overflow-hidden">
              <JsonEditor
                value={value}
                onChange={setValue}
                readOnly={option.readOnly}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function useFullEditor() {
  return useContext(FullEditorContext);
}

export function FullEditorProvider({ children }: PropsWithChildren) {
  const [option, setOption] = useState<FullEditorOption | null>(null);

  const props = useMemo(() => {
    return {
      openEditor: (opt: FullEditorOption) => {
        setOption({
          initialValue: opt.initialValue,
          format: opt.format,
          readOnly: opt.readOnly,
          onCancel: () => {
            if (opt.onCancel) opt.onCancel();
            setOption(null);
          },
          onSave: (value: string) => {
            if (opt.onSave) opt.onSave(value);
            setOption(null);
          },
        });
      },
      closeEditor: () => {
        setOption(null);
      },
    };
  }, [setOption]);

  return (
    <FullEditorContext.Provider value={props}>
      {option && <FullEditorSheet option={option} />}
      <Fragment>{children}</Fragment>
    </FullEditorContext.Provider>
  );
}
