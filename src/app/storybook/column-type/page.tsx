"use client";
import ColumnTypeSelector from "@/components/gui/schema-editor/column-type-selector";
import { MYSQL_DATA_TYPE_SUGGESTION } from "@/drivers/mysql/mysql-data-type";
import { useState } from "react";

export default function ColumnTypeStorybook() {
  const [value, setValue] = useState("");

  return (
    <div className="p-4">
      <ColumnTypeSelector
        value={value}
        onChange={setValue}
        suggestions={MYSQL_DATA_TYPE_SUGGESTION.typeSuggestions!}
      />
    </div>
  );
}
