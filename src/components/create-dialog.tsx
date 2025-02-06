"use client";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";

export function DialogProvider() {
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
    window.showOuterbaseDialog = showToggle;
  }, [showToggle]);

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
  defaultCloseValue?: ReturnType
) {
  return {
    show: (props: ParamType) => {
      return new Promise<ReturnType>((resolve) => {
        window.showOuterbaseDialog({
          component,
          options: props,
          resolve: resolve as unknown as (props: unknown) => void,
          defaultCloseValue,
        });
      });
    },
  } as Readonly<{
    show: (props: ParamType) => Promise<ReturnType>;
  }>;
}
