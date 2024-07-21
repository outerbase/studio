import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { noop } from "@/lib/utils";
import {
  createContext,
  Fragment,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";

interface FullEditorContextValue {
  openEditor: (option: FullEditorOption) => void;
  closeEditor: () => void;
}

interface FullEditorOption {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

const FullEditorContext = createContext<FullEditorContextValue>({
  openEditor: noop,
  closeEditor: noop,
});

function FullEditorSheet({ option }: { option: FullEditorOption }) {
  const [value, setValue] = useState(option.initialValue);

  return (
    <Sheet open>
      <SheetContent
        hideCloseButton
        className="border-none sm:max-w-[1000px] sm:w-[70vw] flex p-0"
      >
        <div className="flex flex-col grow">
          <div className="p-4 flex gap-2">
            <div>
              <Select>
                <SelectTrigger value="markdown">
                  <SelectValue className="w-[200px]" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grow" />
            <Button onClick={option.onCancel} variant={"secondary"}>
              Close
            </Button>
            <Button
              onClick={() => {
                option.onSave(value);
              }}
            >
              Save Change
            </Button>
          </div>
          <Separator />
          <textarea
            autoFocus
            className="flex-grow p-4 w-full outline-none"
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
          />
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
