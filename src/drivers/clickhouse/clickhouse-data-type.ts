import { ColumnTypeSelector } from "../base-driver";

// https://clickhouse.com/docs/en/sql-reference/data-types
export const CLICKHOUSE_DATA_TYPE_SUGGESTION: ColumnTypeSelector = {
  type: "text",
  idTypeName: "UInt64",
  textTypeName: "String",
  typeSuggestions: [
    {
      name: "Integer",
      suggestions: [
        { name: "Int8", description: "Signed 1-byte integer" },
        { name: "Int16", description: "Signed 2-byte integer" },
        { name: "Int32", description: "Signed 4-byte integer" },
        { name: "Int64", description: "Signed 8-byte integer" },
        { name: "Int128", description: "Signed 16-byte integer" },
        { name: "Int256", description: "Signed 32-byte integer" },
        { name: "UInt8", description: "Unsigned 1-byte integer" },
        { name: "UInt16", description: "Unsigned 2-byte integer" },
        { name: "UInt32", description: "Unsigned 4-byte integer" },
        { name: "UInt64", description: "Unsigned 8-byte integer" },
        { name: "UInt128", description: "Unsigned 16-byte integer" },
        { name: "UInt256", description: "Unsigned 32-byte integer" },
        { name: "Bool", description: "Boolean (stored as UInt8)" },
      ],
    },
    {
      name: "Real",
      suggestions: [
        { name: "Float32", description: "Single-precision floating-point" },
        { name: "Float64", description: "Double-precision floating-point" },
        {
          name: "Decimal",
          parameters: [
            {
              name: "precision",
              description: "Total number of digits (1-76)",
              default: "10",
            },
            {
              name: "scale",
              description: "Number of digits after the decimal point",
              default: "2",
            },
          ],
          description: "Fixed-point number",
        },
      ],
    },
    {
      name: "String",
      suggestions: [
        {
          name: "String",
          description: "Variable-length string (UTF-8)",
        },
        {
          name: "FixedString",
          parameters: [{ name: "length", default: "16" }],
          description: "Fixed-length string of N bytes",
        },
        {
          name: "UUID",
          description: "128-bit universally unique identifier",
        },
        {
          name: "JSON",
          description: "Semi-structured JSON data (experimental)",
        },
      ],
    },
    {
      name: "Date/Time",
      suggestions: [
        {
          name: "Date",
          description: "Date (2-byte, range 1970-01-01 to 2149-06-06)",
        },
        {
          name: "Date32",
          description: "Date (4-byte, wider range)",
        },
        {
          name: "DateTime",
          parameters: [
            {
              name: "timezone",
              description: "Optional IANA timezone",
              default: "'UTC'",
            },
          ],
          description: "Second-precision timestamp",
        },
        {
          name: "DateTime64",
          parameters: [
            { name: "precision", description: "0-9 fractional digits", default: "3" },
            { name: "timezone", description: "Optional IANA timezone", default: "'UTC'" },
          ],
          description: "Sub-second precision timestamp",
        },
      ],
    },
    {
      name: "Composite",
      suggestions: [
        {
          name: "Array",
          parameters: [{ name: "type", default: "String" }],
          description: "Array of a single element type",
        },
        {
          name: "Tuple",
          parameters: [{ name: "types", default: "String, UInt64" }],
          description: "Heterogeneous, ordered collection of elements",
        },
        {
          name: "Map",
          parameters: [
            { name: "key", default: "String" },
            { name: "value", default: "String" },
          ],
          description: "Key-value pairs",
        },
        {
          name: "Nullable",
          parameters: [{ name: "type", default: "String" }],
          description: "Wraps a base type to allow NULL values",
        },
        {
          name: "LowCardinality",
          parameters: [{ name: "type", default: "String" }],
          description:
            "Dictionary-encoded wrapper for low-cardinality columns",
        },
        {
          name: "IPv4",
          description: "32-bit IPv4 address",
        },
        {
          name: "IPv6",
          description: "128-bit IPv6 address",
        },
      ],
    },
  ],
};
