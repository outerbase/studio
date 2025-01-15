import { compile } from "@mdx-js/mdx";
import { useEffect, useMemo, useState } from "react";
import { NotebookEditorBlockValue } from "./notebook-editor";

export default function NotebookBlockCode({
  value,
  onChange,
}: {
  value: NotebookEditorBlockValue;
  onChange: (value: NotebookEditorBlockValue) => void;
}) {
  return (
    <div className="p-3">
      <textarea className="w-full resize-none" value={value.value} readOnly />
    </div>
  );
}
