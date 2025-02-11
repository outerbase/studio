"use client";
import SqlEditor from "@/components/gui/sql-editor";
import { useState } from "react";

export default function StorybookEditorPage() {
  const [value, setValue] = useState("");

  return (
    <div>
      <SqlEditor dialect="sqlite" value={value} onChange={setValue} />
    </div>
  );
}
