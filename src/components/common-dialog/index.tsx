"use client";
import { noop } from "lodash";
import {
  PropsWithChildren,
  ReactElement,
  createContext,
  useContext,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Icon } from "@phosphor-icons/react";
import { Loader } from "lucide-react";
import CodePreview from "../gui/code-preview";

interface ShowDialogProps {
  title: string;
  content: string | ReactElement;
  destructive?: boolean;
  previewCode?: string;
  actions?: {
    text: string;
    icon?: Icon;
    onClick: () => Promise<void>;
    onComplete?: () => void;
  }[];
}

interface CommonDialogContextProps {
  showDialog(option: ShowDialogProps): void;
}

const CommonDialogContext = createContext<CommonDialogContextProps>({
  showDialog: noop,
});

export function CommonDialogProvider({ children }: PropsWithChildren) {
  const [dialogOption, setDialogOption] = useState<ShowDialogProps | null>(
    null
  );

  const [loading, setLoading] = useState(false);

  return (
    <CommonDialogContext.Provider value={{ showDialog: setDialogOption }}>
      {children}
      {dialogOption && (
        <Dialog
          open={dialogOption !== null}
          onOpenChange={(openState) => {
            if (!openState) {
              setDialogOption(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader
              className={dialogOption?.destructive ? "text-red-500" : ""}
            >
              {dialogOption.title}
            </DialogHeader>
            <DialogDescription className="flex flex-col gap-2">
              <div>{dialogOption.content}</div>
              {dialogOption.previewCode && (
                <CodePreview code={dialogOption.previewCode} />
              )}
            </DialogDescription>
            <DialogFooter>
              {dialogOption.actions?.map((action) => (
                <Button
                  key={action.text}
                  className={
                    dialogOption.destructive ? "bg-red-500 text-white" : ""
                  }
                  disabled={loading}
                  onClick={() => {
                    setLoading(true);

                    action
                      .onClick()
                      .then(() => {
                        setDialogOption(null);
                        if (action.onComplete) {
                          action.onComplete();
                        }
                      })
                      .catch(console.error)
                      .finally(() => {
                        setLoading(false);
                      });
                  }}
                >
                  {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  {action.icon && !loading && (
                    <action.icon className="w-4 h-4 mr-2" />
                  )}
                  {action.text}
                </Button>
              ))}

              <Button
                disabled={loading}
                variant={"secondary"}
                onClick={() => {
                  setDialogOption(null);
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </CommonDialogContext.Provider>
  );
}

export function useCommonDialog() {
  return useContext(CommonDialogContext);
}
