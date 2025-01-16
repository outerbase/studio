import Markdown from "react-markdown";
import { NotebookEditorBlockValue } from "./notebook-editor";

export default function NotebookBlockCode({
  value,
  onChange,
}: {
  value: NotebookEditorBlockValue;
  onChange: (value: NotebookEditorBlockValue) => void;
}) {
  return (
    <div className="mt-4 mdx-content">
      <Markdown>{value.value}</Markdown>
    </div>
  );
}
