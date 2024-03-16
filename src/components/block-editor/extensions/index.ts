import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { CodeBlock } from "./code-block";

export { uploadFile } from "./file-upload";

export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    codeBlock: CodeBlock
  }
})
