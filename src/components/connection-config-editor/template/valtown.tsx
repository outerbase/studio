import { ConnectionTemplateList } from "@/app/(outerbase)/base-template";
import Link from "next/link";
import { CommonConnectionConfigTemplate } from "..";

const template: CommonConnectionConfigTemplate = [
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
  <div className="bg-secondary m-4 flex flex-col gap-4 rounded-lg border p-4 text-base leading-6 shadow">
    <h2 className="font-bold">How to</h2>
    <p>
      Outerbase Studio is a powerful SQLite GUI, perfect for managing
      Val.town&apos;s database. Connecting is easy—just follow these steps:
    </p>

    <ul className="ml-8 list-disc">
      <li>
        Goto{" "}
        <Link
          className="text-blue-600 underline"
          href="https://www.val.town/settings/api"
          target="_blank"
        >
          API Token Setting
        </Link>
      </li>
      <li>Click &quot;New&quot; if you haven&apos;t generated token before</li>
      <li>Copy the token</li>
    </ul>
  </div>
);

export const ValtownConnectionTemplate: ConnectionTemplateList = {
  template,
  instruction,
  localFrom: (value) => {
    return {
      name: value.name,
      token: value.token,
    };
  },
  localTo: (value) => {
    return {
      driver: "valtown",
      name: value.name,
      token: value.token,
    };
  },
};
