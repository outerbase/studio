import { BaseDriver, CollaborationDriver } from "@libsqlstudio/gui/driver";
import { Studio, StudioExtension } from "@libsqlstudio/gui";
import { useTheme } from "@studio/context/theme-provider";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { triggerSelectFiles, uploadFile } from "./file-upload";
import {
  BlockEditorProvider,
  useBlockEditor,
} from "@studio/context/block-editor-provider";

interface MyStudioProps {
  name: string;
  color: string;
  driver: BaseDriver;
  collabarator?: CollaborationDriver;
}

function MyStudioInternal({
  name,
  color,
  driver,
  collabarator,
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
        <strong>LibStudio Studio</strong> is open-source database GUI.
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
  }, []);

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
