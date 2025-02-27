import { ColumnTypeSelector } from "../base-driver";

//https://www.postgresql.org/docs/current/datatype.html
export const POSTGRES_DATA_TYPE_SUGGESTION: ColumnTypeSelector = {
  type: "text",
  idTypeName: "Integer",
  textTypeName: "VARCHAR(255)",
  typeSuggestions: [
    {
      name: "Integer",
      suggestions: [
        {
          name: "serial",
          description: "autoincrementing four-byte integer",
        },
        {
          name: "boolean",
          description: "Logical Boolean (true/false)",
        },
        {
          name: "smallint",
          description: "Signed two-byte integer",
        },
        {
          name: "integer",
          description: "Signed four-byte integer",
        },
        {
          name: "bigint",
          description: "Signed eight-byte integer",
        },
      ],
    },
    {
      name: "Real",
      suggestions: [
        { name: "real", description: "4 byte float" },
        { name: "double precision", description: "8 byte float" },
        {
          name: "numeric",
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
          name: "text",
          description: "A text column with a maximum length of 65,535.",
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
          name: "bit",
          parameters: [{ name: "length", default: "255" }],
          description: "Fixed-length bit string",
        },
        {
          name: "varbit",
          parameters: [{ name: "length", default: "255" }],
          description: "Variable-length bit string",
        },
        {
          name: "bytea",
          description: "Binary data (“byte array”)",
        },
      ],
    },
    {
      name: "Date",
      suggestions: [
        { name: "date", description: "Date" },
        { name: "time", description: "Time" },
        { name: "timetz", description: "Time of day, including time zone" },
        { name: "timestamp", description: "Date and time (no time zone)" },
        {
          name: "timestamptz",
          description: "Date and time, including time zone",
        },
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
      <div class="text-sm">Precision</div>
      <div class="inline-block border-t-4 border-t-primary font-mono text-lg">
        <span>${exampleBeforeDot}</span><strong>.</strong><span class="inline-block border-b-4 border-b-primary">${exampleAfterDot}</span>
      </div>
      <div class="text-sm text-right">Scale</div>
    </div>
  </div>`;
  }

  return `<div>Fixed-point number</div>`;
}
