import {
  type Block,
  type BlockContent,
  BlockEditorSheet,
} from "../components/block-editor";
import parseSafeJson from "@gui/lib/json-safe";
import { noop } from "@gui/lib/utils";
import {
  Fragment,
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface BlockEditorContext {
  openBlockEditor: (configs: {
    initialContent?: string;
    onSave: (json: string) => void;
    onCancel?: () => void;
  }) => void;
  closeBlockEditor: () => void;
}

const BlockEditorContext = createContext<BlockEditorContext | null>(null);

export function useBlockEditor() {
  const context = useContext(BlockEditorContext);

  if (!context) {
    throw new Error("useBlockEditor must be used within a BlockEditorProvider");
  }

  return context;
}

export interface BlockEditorConfigs {
  initialContent?: BlockContent<Block>;
  onSave: (json: string) => void;
  onCancel: () => void;
}

export function BlockEditorProvider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const [configs, setConfigs] = useState<BlockEditorConfigs | null>(null);

  const closeBlockEditor = useCallback(() => {
    setOpen(false);
    setConfigs(null);
  }, []);

  const openBlockEditor: BlockEditorContext["openBlockEditor"] = useCallback(
    ({ initialContent, onSave, onCancel = noop }) => {
      const parsedInitialContent = parseSafeJson<BlockContent<Block>>(
        initialContent,
        { format: "BLOCK_NOTE", content: undefined }
      );

      setConfigs({
        initialContent: parsedInitialContent,
        onSave: (json: string) => {
          onSave(json);
          closeBlockEditor();
        },
        onCancel: () => {
          onCancel();
          closeBlockEditor();
        },
      });

      setOpen(true);
    },
    [closeBlockEditor]
  );

  const value = useMemo(
    () => ({
      openBlockEditor,
      closeBlockEditor,
    }),
    [openBlockEditor, closeBlockEditor]
  );

  return (
    <BlockEditorContext.Provider value={value}>
      <BlockEditorSheet open={open} configs={configs} />
      <Fragment>{children}</Fragment>
    </BlockEditorContext.Provider>
  );
}
