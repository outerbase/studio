export { BlockEditor, type BlockEditorProps } from "./editor";
export { BlockEditorSheet, type BlockEditorSheetProps } from "./sheet";
export { type Block } from "./extensions";

export const CONTENT_FORMAT = {
  BLOCK_NOTE: "BLOCK_NOTE",
} as const;

export interface BlockContent<TContent = any> {
  format: "BLOCK_NOTE";
  content: TContent[] | undefined;
}
