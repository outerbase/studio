import { useTheme } from "@/context/theme-provider";
import { useRouter } from "next/navigation";
import { ReactElement, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { triggerSelectFiles, uploadFile } from "./file-upload";
import {
  BlockEditorProvider,
  useBlockEditor,
} from "@/context/block-editor-provider";
import { BaseDriver } from "@/drivers/base-driver";
import { CollaborationBaseDriver } from "@/drivers/collaboration-driver-base";
import { Studio, StudioExtension } from "./gui/studio";
import { SavedDocDriver } from "@/drivers/saved-doc/saved-doc-driver";

interface MyStudioProps {
  name: string;
  color: string;
  driver: BaseDriver;
  expiredAt?: number;
  collabarator?: CollaborationBaseDriver;
  docDriver?: SavedDocDriver;
  sideBarFooterComponent?: ReactElement;
}

function MyStudioInternal({
  name,
  color,
  driver,
  docDriver,
  collabarator,
  sideBarFooterComponent,
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

  return (
    <Studio
      driver={driver}
      name={name}
      color={color ?? "blue"}
      theme={theme}
      onThemeChange={toggleTheme}
      onBack={goBack}
      collaboration={collabarator}
      docDriver={docDriver}
      sideBarFooterComponent={sideBarFooterComponent}
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
