export { BlockEditor, type BlockEditorProps } from "./editor";
export {
  useBlockEditorSheet,
  BlockEditorSheet,
  type BlockEditorSheetProps,
} from "./sheet";

export const CONTENT_FORMAT = {
  BLOCK_NOTE: "BLOCK_NOTE",
} as const;

export interface BlockContent<TContent = any> {
  format: "BLOCK_NOTE";
  content: TContent[];
}
