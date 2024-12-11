"use client";
import ColumnTypeSelector from "@/components/gui/schema-editor/column-type-selector";
import { ColumnTypeSuggestionGroup } from "@/drivers/base-driver";
import { useState } from "react";

const MYSQL_SUGGESTION_GROUP: ColumnTypeSuggestionGroup[] = [
  {
    name: "String",
    suggestions: [
      { name: "char", description: "Fixed-length string" },
      {
        name: "varchar",
        parameters: [{ name: "length", default: "255" }],
        description: "Variable-length string",
      },
      { name: "text", description: "Variable-length string" },
    ],
  },
  {
    name: "Number",
    suggestions: [
      { name: "tinyint", description: "1 byte integer" },
      { name: "smallint", description: "2 byte integer" },
      { name: "mediumint", description: "3 byte integer" },
      { name: "int", description: "4 byte integer" },
      { name: "bigint", description: "8 byte integer" },
      { name: "float", description: "4 byte float" },
      { name: "double", description: "8 byte float" },
      {
        name: "decimal",
        parameters: [
          {
            name: "precision",
            description: "Total number of digits",
            default: "10",
          },
          {
            name: "scale",
            description: "Number of digits after the decimal point",
            default: "2",
          },
        ],
        description: (_: string, parameters?: string[]) => {
          const precision = Number(parameters?.[0]);
          const scale = Number(parameters?.[1] ?? 0);

          if (
            Number.isFinite(precision) &&
            Number.isFinite(scale) &&
            Number.isInteger(precision) &&
            Number.isInteger(scale) &&
            precision > 0 &&
            precision < 20
          ) {
            const exampleNumber = "12345678901234567890".substring(
              0,
              precision
            );
            const exampleBeforeDot = exampleNumber.substring(
              0,
              precision - scale
            );
            const exampleAfterDot = exampleNumber.substring(precision - scale);

            return `<div>
            <div class="mb-2">Fixed-point number</div>
            <div class='inline-block'>
              <div class="text-xs">Precision</div>
              <div class="inline-block border-t-4 border-t-primary font-mono text-lg">
                <span>${exampleBeforeDot}</span><strong>.</strong><span class="inline-block border-b-4 border-b-primary">${exampleAfterDot}</span>
              </div>
              <div class="text-xs text-right">Scale</div>
            </div>
          </div>`;
          }

          return `<div>Fixed-point number</div>`;
        },
      },
    ],
  },
];

export default function ColumnTypeStorybook() {
  const [value, setValue] = useState("");

  return (
    <div className="p-4">
      <ColumnTypeSelector
        value={value}
        onChange={setValue}
        suggestions={MYSQL_SUGGESTION_GROUP}
      />
    </div>
  );
}
