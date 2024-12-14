import { ColumnTypeSelector } from "../base-driver";

export const MYSQL_DATA_TYPE_SUGGESTION: ColumnTypeSelector = {
  type: "text",
  typeSuggestions: [
    {
      name: "Integer",
      suggestions: [
        {
          name: "tinyint",
          description:
            "A very small integer. The signed range is -128 to 127. The unsigned range is 0 to 255",
        },
        {
          name: "smallint",
          description:
            "A small integer. The signed range is -32,768 to 32,767. The unsigned range is 0 to 65,535",
        },
        {
          name: "mediumint",
          description:
            "A medium-sized integer. The signed range is -8,388,608 to 8,388,607. The unsigned range is 0 to 16,777,215",
        },
        {
          name: "int",
          description:
            "A normal-size integer. The signed range is -2,147,483,648 to 2,147,483,647. The unsigned range is 0 to 4,294,967,295",
        },
        {
          name: "bigint",
          description:
            "A large integer. The signed range is -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807. The unsigned range is 0 to 18,446,744,073,709,551,615",
        },
      ],
    },
    {
      name: "Real",
      suggestions: [
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
          description: decimalDescription,
        },
      ],
    },
    {
      name: "Text",
      suggestions: [
        {
          name: "char",
          parameters: [{ name: "length", default: "255" }],
          description: "Fixed-length string",
        },
        {
          name: "varchar",
          parameters: [{ name: "length", default: "255" }],
          description: "Variable-length string",
        },
        {
          name: "tinytext",
          description: "A text column with a maximum length of 255 characters.",
        },
        {
          name: "text",
          description: "A text column with a maximum length of 65,535.",
        },
        {
          name: "mediumtext",
          description: "A text column with a maximum length of 16,777,215",
        },
        {
          name: "longtext",
          description: "A text column with a maximum length of 4,294,960,295",
        },
        {
          name: "json",
          description:
            "Document stored in JSON column are converted to an internal format that permits quick read access to document elements",
        },
        {
          name: "uuid",
          description:
            "The UUID data type is intended for the storage of 128.bit UUID.",
        },
      ],
    },
    {
      name: "Binary",
      suggestions: [
        {
          name: "binary",
          parameters: [{ name: "length", default: "255" }],
          description: "Fixed-length binary",
        },
        {
          name: "varbinary",
          parameters: [{ name: "length", default: "255" }],
          description: "Variable-length binary",
        },
        {
          name: "tinyblob",
          description: "A blob column with a maximum length of 255 bytes",
        },
        {
          name: "blob",
          description: "A blob column with a maximum length of 65,535 bytes",
        },
        {
          name: "mediumblob",
          description:
            "A blob column with a maximum length of 16,777,215 bytes",
        },
        {
          name: "longblob",
          description:
            "A blob column with a maximum length of 4,294,967,295 bytes",
        },
      ],
    },
    {
      name: "Date",
      suggestions: [
        { name: "date", description: "Date" },
        { name: "time", description: "Time" },
        { name: "datetime", description: "Date and time" },
        { name: "timestamp", description: "Date and time" },
        { name: "year", description: "Year" },
      ],
    },
    {
      name: "Geometry",
      suggestions: [
        { name: "geometry", description: "Geometry" },
        { name: "point", description: "Point" },
        { name: "linestring", description: "Line string" },
        { name: "polygon", description: "Polygon" },
        { name: "multipoint", description: "Multi point" },
        { name: "multilinestring", description: "Multi line string" },
        { name: "multipolygon", description: "Multi polygon" },
        { name: "geometrycollection", description: "Geometry collection" },
      ],
    },
    {
      name: "Miscellaneous",
      suggestions: [
        { name: "enum", description: "Enumerated string" },
        { name: "set", description: "" },
      ],
    },
  ],
};

function decimalDescription(_: string, parameters?: string[]) {
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
    const exampleNumber = "12345678901234567890".substring(0, precision);
    const exampleBeforeDot = exampleNumber.substring(0, precision - scale);
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
}
