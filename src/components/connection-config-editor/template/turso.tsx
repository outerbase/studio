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
    <h2 className="text-lg font-bold">Connect to Turso</h2>
    <p>
      To connect to the Turso database, you need to generate a database token.
      Follow these steps via the Turso dashboard
    </p>

    <ul className="ml-8 list-disc">
      <li>Go to the Turso Database section.</li>
      <li>Navigate to the Database menu.</li>
      <li>
        Click on &quot;Get Token&quot; on the right side of the database you
        want to connect.
      </li>

      <li>
        Click <strong>&quot;Generate Token&quot;</strong> and then copy the
        token.
      </li>
    </ul>
    <h2 className="text-lg font-bold">Connect to Local LibSQL</h2>
    <ul className="ml-8 list-disc">
      <li>
        Running{" "}
        <span className="bg-background p-1 px-2 font-mono">turso dev</span>
      </li>

      <li>
        Fill URL{" "}
        <span className="bg-background p-1 px-2 font-mono">
          http://127.0.0.1:8080
        </span>
      </li>

      <li>Leave the access token blank</li>
    </ul>
  </div>
);

export const TursoConnectionTemplate: ConnectionTemplateList = {
  template,
  instruction,
  localFrom: (value) => {
    return {
      name: value.name,
      host: value.url,
      token: value.token,
    };
  },
  localTo: (value) => {
    return {
      name: value.name,
      driver: "turso",
      url: value.host,
      token: value.token,
    };
  },
};
