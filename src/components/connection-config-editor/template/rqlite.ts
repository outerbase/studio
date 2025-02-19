import { CommonConnectionConfigTemplate } from "..";

export const RQLITE_CONNECTION_TEMPLATE: CommonConnectionConfigTemplate = [
  {
    columns: [
      {
        name: "host",
        label: "Host",
        type: "text",
        required: true,
        placeholder: "Hostname or IP address",
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
        placeholder: "Database password",
      },
    ],
  },
];
