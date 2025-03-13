import { ConnectionTemplateList } from "@/app/(outerbase)/base-template";
import { CommonConnectionConfigTemplate } from "..";

const template: CommonConnectionConfigTemplate = [
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
        name: "starbase_type",
        label: "Starbase Type",
        type: "options",
        options: [
          { value: "internal", content: "Internal" },
          { value: "external", content: "External" },
          { value: "hyperdrive", content: "Hyperdrive" },
        ],
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

const instruction = (
  <div className="bg-secondary m-4 flex flex-col gap-4 rounded-lg border p-4 text-base leading-7 shadow">
    <h2 className="text-lg font-bold">How to</h2>

    <p>
      You can get your access token from{" "}
      <span className="bg-background p-1 px-2 font-mono">wrangler.toml</span>{" "}
      inside your <strong>StarbaseDb</strong> project
    </p>

    <div className="bg-background flex flex-col p-2 font-mono">
      <span>[vars]</span>
      <span>
        ADMIN_AUTHORIZATION_TOKEN ={" "}
        <strong className="text-red-500">&quot;xxxxxxxxxxxxxxxxxx&quot;</strong>
      </span>
    </div>
  </div>
);

export const StarbaseConnectionTemplate: ConnectionTemplateList = {
  template,
  instruction,
  localFrom: (value) => {
    return {
      name: value.name,
      host: value.url,
      token: value.token,
      starbase_type: value.starbase_type,
    };
  },
  localTo: (value) => {
    return {
      name: value.name,
      driver: "starbase",
      url: value.host,
      token: value.token,
      starbase_type: value.starbase_type,
    };
  },
  remoteFrom: (value) => {
    return {
      name: value.name,
      host: value.source.host,
      username: value.source.user,
      database: value.source.database,
      port: value.source.port,
    };
  },
  remoteTo: (value) => {
    return {
      name: value.name,
      source: {
        host: value.host,
        user: value.username,
        password: value.password,
        database: value.database,
        port: value.port,
        type: "starbasedb",
        base_id: "",
      },
    };
  },
};
