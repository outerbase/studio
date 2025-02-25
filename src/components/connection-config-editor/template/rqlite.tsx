import { ConnectionTemplateList } from "@/app/(outerbase)/base-template";
import { CommonConnectionConfigTemplate } from "..";

const template: CommonConnectionConfigTemplate = [
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

const instruction = (
  <div className="bg-secondary m-4 flex flex-col gap-4 rounded-lg border p-4 text-base leading-7 shadow">
    <h2 className="text-lg font-bold">How to</h2>
    <p>
      You should include Outerbase Studio in the list of allowed origins for{" "}
      <strong>CORS (Cross-Origin Resource Sharing)</strong>
    </p>
    <pre className="bg-background p-2">
      rqlited --http-allow-origin=&quot;https://studio.outerbase.com&quot;
    </pre>
  </div>
);

export const RqliteConnectionTemplate: ConnectionTemplateList = {
  template,
  instruction,
  localFrom: (value) => {
    return {
      name: value.name,
      host: value.url,
      username: value.username,
      password: value.password,
    };
  },
  localTo: (value) => {
    return {
      name: value.name,
      driver: "rqlite",
      url: value.host,
      username: value.username,
      password: value.password,
    };
  },
};
