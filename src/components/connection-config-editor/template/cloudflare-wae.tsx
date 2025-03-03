import { ConnectionTemplateList } from "@/app/(outerbase)/base-template";
import { CommonConnectionConfigTemplate } from "..";

const template: CommonConnectionConfigTemplate = [
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
        name: "token",
        label: "API Token",
        type: "textarea",
        required: true,
        placeholder: "API Token",
      },
    ],
  },
];

export const CloudflareWAEConnectionTemplate: ConnectionTemplateList = {
  localFrom: (value) => {
    return {
      name: value.name,
      database: value.database,
      token: value.token,
      username: value.username,
    };
  },
  localTo: (value) => {
    return {
      name: value.name,
      driver: "cloudflare-wae",
      database: value.database,
      token: value.token,
      username: value.username,
    };
  },
  template,
  instruction: <div></div>,
};
