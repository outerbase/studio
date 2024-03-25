import { insertOrUpdateBlock } from "@blocknote/core";
import { schema } from "../extensions";
import { CodeIcon } from "lucide-react";

export const insertCodeBlock = (editor: typeof schema.BlockNoteEditor) => ({
  title: "Code Block",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      type: "codeBlock",
      props: {
        language: "plaintext",
        code: "",
      },
    });
  },
  subtext: "Code Block with syntax highlighting.",
  alias: ["code", "code block"],
  group: "Advanced",
  icon: <CodeIcon />,
});
