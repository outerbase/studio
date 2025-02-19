import { CommonConnectionConfigTemplate } from "..";

export const CLOUDFLARE_CONNECTION_TEMPLATE: CommonConnectionConfigTemplate = [
  {
    columns: [
      {
        name: "username",
        label: "Account ID",
        type: "text",
        required: true,
        placeholder: "Account ID",
      },
    ],
  },
  {
    columns: [
      {
        name: "database",
        label: "Database ID",
        type: "text",
        required: true,
        placeholder: "Database ID",
      },
    ],
  },
  {
    columns: [
      {
        name: "token",
        label: "API Token",
        type: "textarea",
        required: true,
        placeholder: "API Token",
      },
    ],
  },
];
