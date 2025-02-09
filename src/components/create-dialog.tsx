"use client";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";

type DialogProviderSlot = "default" | "workspace" | "base";

export function DialogProvider({
  slot = "default",
}: {
  slot?: DialogProviderSlot;
}) {
  const [open, setOpen] = useState(false);
  const [component, setComponent] = useState<FunctionComponent>();
  const [options, setOptions] = useState<unknown>();
  const [resolve, setResolve] = useState<(props: unknown) => void>();
  const [defaultCloseValue, setDefaultCloseValue] = useState<unknown>();

  const DialogComponent = component;

  const showToggle = useCallback(
    ({
      component,
      options,
      resolve,
      defaultCloseValue,
    }: {
      component: FunctionComponent;
      options: unknown;
      resolve: (props: unknown) => void;
      defaultCloseValue: unknown;
    }) => {
      setComponent(() => component);
      setOptions(options);
      setResolve(() => resolve);
      setDefaultCloseValue(defaultCloseValue);
      setOpen(true);
    },
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.showOuterbaseDialog) {
      window.showOuterbaseDialog = {};
    }

    window.showOuterbaseDialog[slot] = showToggle;
    return () => {
      delete window.showOuterbaseDialog[slot];
    };
  }, [showToggle, slot]);

  return (
    <>
      {open && DialogComponent && (
        <Dialog
          open={open}
          onOpenChange={(state) => {
            if (!state) {
              if (resolve) resolve(defaultCloseValue);
              setOpen(false);
            }
          }}
        >
          <DialogContent>
            <DialogComponent
              {...(options as any)}
              close={(value: unknown) => {
                if (resolve) resolve(value);
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

type DialogComponentProps<
  ParamType = unknown,
  ReturnType = undefined,
> = ParamType & {
  close: (value: ReturnType) => void;
};

export function createDialog<ParamType = unknown, ReturnType = undefined>(
  component: FunctionComponent<DialogComponentProps<ParamType, ReturnType>>,
  options?: {
    defaultValue?: ReturnType;

    /**
     * Slot to render the dialog in. If not specified,
     * it will be rendered to the deepest available slot.
     */
    slot?: DialogProviderSlot;
  }
) {
  return {
    show: (props: ParamType) => {
      return new Promise<ReturnType>((resolve) => {
        if (!window.showOuterbaseDialog) return;

        let slot = options?.slot;

        if (!slot) {
          if (window.showOuterbaseDialog["base"]) slot = "base";
          else if (window.showOuterbaseDialog["workspace"]) slot = "workspace";
          else slot = "default";
        }

        if (!window.showOuterbaseDialog[slot]) return;

        window.showOuterbaseDialog[slot]({
          component,
          options: props,
          resolve: resolve as unknown as (props: unknown) => void,
          defaultCloseValue: options?.defaultValue,
        });
      });
    },
  } as Readonly<{
    show: (props: ParamType) => Promise<ReturnType>;
  }>;
}
