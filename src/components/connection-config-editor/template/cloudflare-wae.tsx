import { ConnectionTemplateList } from "@/app/(outerbase)/base-template";
import Link from "next/link";
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
  instruction: (
    <div className="bg-secondary m-4 flex flex-col gap-4 rounded-lg border p-4 text-base leading-7 shadow">
      <div className="rounded-lg bg-red-200 p-4 text-sm dark:bg-red-700">
        <p>
          <strong>IMPORTANT</strong>: To bypass CORS (Cross-Origin Resource
          Sharing), your credentials will be proxied through our server. If you
          have security concerns, you can self-host the studio.
        </p>
      </div>

      <h2 className="font-bold">Find Your Cloudflare Account ID</h2>
      <p>
        Log in to your Cloudflare account and check the URL in your browser.
        Your Account ID is included in the URL, as shown below:
      </p>
      <div className="bg-background flex flex-col p-2 font-mono">
        <span className="">
          https://dash.cloudflare.com/
          <strong className="text-red-500">{"<your_account_id>"}</strong>
        </span>
      </div>

      <h2 className="font-bold">Create an API token</h2>

      <p>
        Create an{" "}
        <Link
          href="https://dash.cloudflare.com/profile/api-tokens"
          target="_blank"
          className="text-blue-500 underline"
        >
          API Token ↗
        </Link>{" "}
        that has the <strong>Account Analytics Read</strong> permission.
      </p>
    </div>
  ),
};
