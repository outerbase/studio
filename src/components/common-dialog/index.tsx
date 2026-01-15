"use client";
import { Icon } from "@phosphor-icons/react";
import noop from "lodash/noop";
import { Loader } from "lucide-react";
import {
  PropsWithChildren,
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import CodePreview from "../gui/code-preview";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

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

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const hideDialog = useCallback(() => {
    setErrorMessage("");
    setDialogOption(null);
  }, []);

  return (
    <CommonDialogContext.Provider value={{ showDialog: setDialogOption }}>
      {children}
      {dialogOption && (
        <Dialog
          open={dialogOption !== null}
          onOpenChange={(openState) => {
            if (!openState) {
              hideDialog();
            }
          }}
        >
          <DialogContent>
            <DialogHeader
              className={dialogOption?.destructive ? "text-red-500" : ""}
            >
              <DialogTitle>{dialogOption.title}</DialogTitle>
            </DialogHeader>

            {errorMessage && (
              <div className="flex items-end gap-4 font-mono text-sm text-red-500">
                <p>{errorMessage}</p>
              </div>
            )}

            <div>{dialogOption.content}</div>
            {dialogOption.previewCode && (
              <CodePreview code={dialogOption.previewCode} />
            )}

            <DialogDescription className="flex flex-col gap-2"></DialogDescription>

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
                        hideDialog();
                        if (action.onComplete) {
                          action.onComplete();
                        }
                      })
                      .catch((e) => {
                        if (e instanceof Error) {
                          setErrorMessage(e.message);
                        } else {
                          setErrorMessage("An error occurred");
                        }
                      })
                      .finally(() => {
                        setLoading(false);
                      });
                  }}
                >
                  {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  {action.icon && !loading && (
                    <action.icon className="mr-2 h-4 w-4" />
                  )}
                  {action.text}
                </Button>
              ))}

              <Button
                disabled={loading}
                variant={"secondary"}
                onClick={() => {
                  hideDialog();
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
