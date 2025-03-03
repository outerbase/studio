import { CommonConnectionConfigTemplate } from "..";

export const GENERIC_CONNECTION_TEMPLATE: CommonConnectionConfigTemplate = [
  {
    columns: [
      {
        name: "host",
        label: "Host",
        type: "text",
        required: true,
        placeholder: "Hostname or IP address",
      },
      {
        name: "port",
        label: "Port",
        type: "text",
        required: true,
        placeholder: "Port",
        size: "max-w-[100px]",
      },
    ],
  },
  {
    columns: [
      {
        name: "username",
        label: "Username",
        type: "text",
        required: true,
        placeholder: "Database username",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
        placeholder: "Database password",
      },
    ],
  },
  {
    columns: [
      {
        name: "database",
        label: "Database",
        type: "text",
        placeholder: "Database name",
      },
    ],
  },
  {
    columns: [
      {
        name: "ssl",
        label: "Use SSL",
        type: "checkbox",
      },
    ],
  },
];
