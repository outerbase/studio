import { useTheme } from "@/context/theme-provider";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { triggerSelectFiles, uploadFile } from "./file-upload";
import {
  BlockEditorProvider,
  useBlockEditor,
} from "@/context/block-editor-provider";
import { BaseDriver } from "@/drivers/base-driver";
import { CollaborationBaseDriver } from "@/drivers/collaboration-driver-base";
import { Studio, StudioExtension } from "./gui/studio";

interface MyStudioProps {
  name: string;
  color: string;
  driver: BaseDriver;
  expiredAt?: number;
  collabarator?: CollaborationBaseDriver;
}

function calcuateFromExpire(expiredAt: number) {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, expiredAt - now);
}

function TemporarySession({ expiredAt }: { expiredAt: number }) {
  const [countdownInSec, setCountdownInSec] = useState(
    calcuateFromExpire(expiredAt)
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCountdownInSec(calcuateFromExpire(expiredAt));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [expiredAt, setCountdownInSec]);

  const min = Math.floor(countdownInSec / 60);
  const sec = countdownInSec % 60;

  return (
    <div className="border-b pb-1">
      <div className="flex gap-0.5 mb-1">
        <span className="p-1 px-2 rounded  mono text-center bg-black text-white">
          {Math.floor(min / 10)}
        </span>
        <span className="p-1 px-2 rounded  mono text-center bg-black text-white">
          {min % 10}
        </span>
        <span className="p-1 rounded  mono text-center ">:</span>
        <span className="p-1 px-2 rounded  mono text-center bg-black text-white">
          {Math.floor(sec / 10)}
        </span>
        <span className="p-1 px-2 rounded  mono text-center bg-black text-white">
          {sec % 10}
        </span>
      </div>
      <p className="text-xs">Remaining of your temporary session</p>
    </div>
  );
}

function MyStudioInternal({
  name,
  color,
  driver,
  collabarator,
  expiredAt,
}: MyStudioProps) {
  const router = useRouter();
  const { openBlockEditor } = useBlockEditor();
  const { theme, toggleTheme } = useTheme();

  const goBack = useCallback(() => {
    router.push("/connect");
  }, [router]);

  const extensions = useMemo<StudioExtension[]>(() => {
    return [
      {
        contextMenu: (state) => {
          return [
            {
              title: "Upload File",
              onClick: async () => {
                const files = await triggerSelectFiles();

                if (files.error) return toast.error(files.error.message);

                const file = files.value[0];
                if (!file) return;

                const toastId = toast.loading("Uploading file...");
                const { data, error } = await uploadFile(file);
                if (error)
                  return toast.error("Upload failed!", {
                    id: toastId,
                    description: error.message,
                  });

                state.setFocusValue(data.url);
                return toast.success("File uploaded!", { id: toastId });
              },
            },
          ];
        },
      },
      {
        contextMenu: (state) => {
          return [
            {
              title: "Edit with Block Editor",
              onClick: () => {
                openBlockEditor({
                  initialContent: state.getFocusValue() as string,
                  onSave: (newValue) => state.setFocusValue(newValue),
                });
              },
            },
          ];
        },
      },
    ];
  }, [openBlockEditor]);

  const sideBanner = useMemo(() => {
    return (
      <div className="text-sm p-3 px-4">
        {expiredAt ? (
          <TemporarySession expiredAt={expiredAt} />
        ) : (
          <p>
            <strong>LibStudio Studio</strong> is open-source database GUI.
          </p>
        )}

        <ul className="list-disc ml-6 mt-2">
          <li className="mb-1">
            <a
              className="text-blue-700 underline dark:text-blue-400"
              href={"https://github.com/invisal/libsql-studio/issues"}
              target="_blank"
              rel="noreferrer"
            >
              Request New Features
            </a>
          </li>
          <li>
            <a
              className="text-blue-700 underline dark:text-blue-400"
              href={"https://github.com/invisal/libsql-studio/issues"}
              target="_blank"
              rel="noreferrer"
            >
              Report Bugs
            </a>
          </li>
        </ul>
      </div>
    );
  }, [expiredAt]);

  return (
    <Studio
      driver={driver}
      name={name}
      color={color ?? "blue"}
      theme={theme}
      onThemeChange={toggleTheme}
      onBack={goBack}
      collaboration={collabarator}
      sideBarFooterComponent={sideBanner}
      extensions={extensions}
    />
  );
}

export default function MyStudio(props: MyStudioProps) {
  return (
    <BlockEditorProvider>
      <MyStudioInternal {...props} />
    </BlockEditorProvider>
  );
}
