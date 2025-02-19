"use client";
import {
  CommonConnectionConfig,
  CommonConnectionConfigTemplate,
  ConnectionConfigEditor,
} from "@/components/connection-config-editor";
import { useState } from "react";

const TESTING_TEMPLATE: CommonConnectionConfigTemplate = [
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
        name: "token",
        label: "Access Token",
        type: "textarea",
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

export default function StorybookConnectionEditor() {
  const [value, setValue] = useState<CommonConnectionConfig>({ name: "" });

  return (
    <ConnectionConfigEditor
      template={TESTING_TEMPLATE}
      value={value}
      onChange={setValue}
    />
  );
}
