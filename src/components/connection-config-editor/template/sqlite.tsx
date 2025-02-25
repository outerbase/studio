import { ConnectionTemplateList } from "@/app/(outerbase)/base-template";
import { CommonConnectionConfigTemplate } from "..";

const template: CommonConnectionConfigTemplate = [
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

export const SqliteConnectionTemplate: ConnectionTemplateList = {
  template,
  localFrom: (value) => {
    return {
      name: value.name,
      filehandler: value.file_handler,
    };
  },
  localTo: (value) => {
    return {
      name: value.name,
      driver: "sqlite-filehandler",
      file_handler: value.filehandler,
    };
  },
};
