import { CommonConnectionConfigTemplate } from "..";

export const TURSO_CONNECTION_TEMPLATE: CommonConnectionConfigTemplate = [
  {
    columns: [
      {
        name: "host",
        label: "URL",
        type: "text",
        required: true,
        placeholder: "URL",
      },
    ],
  },
  {
    columns: [
      {
        name: "token",
        label: "Access Token",
        type: "textarea",
        required: false,
        placeholder: "Access Token",
      },
    ],
  },
];
