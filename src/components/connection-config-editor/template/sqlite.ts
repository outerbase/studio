import { CommonConnectionConfigTemplate } from "..";

export const SQLITE_CONNECTION_TEMPLATE: CommonConnectionConfigTemplate = [
  {
    columns: [
      {
        name: "filehandler",
        label: "File",
        type: "file",
        required: true,
        placeholder: "Please select file",
      },
    ],
  },
];
