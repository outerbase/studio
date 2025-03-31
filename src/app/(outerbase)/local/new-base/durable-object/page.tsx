"use client";
import { Button } from "@/components/orbit/button";
import { ArrowLeft } from "@phosphor-icons/react";

export default function DurableObjectInstructPage() {
  const highlightClassName =
    "bg-green-200 px-2 py-0.5 font-bold dark:bg-green-800 dark:text-white";

  return (
    <div className="container">
      <div className="my-8 flex">
        <Button variant="secondary" size="lg" href="/local" as="link">
          <ArrowLeft />
          Back
        </Button>
      </div>

      <div className="max-w-[700px]">
        <h1 className="text-2xl font-bold">Browsable Durable Object</h1>

        <p className="my-4">
          Since Durable Objects aren&apos;t accessible outside of a Worker,
          Outerbase Studio can&apos;t connect to them directly. However, we
          offer a decorator you can attach to your Worker to expose the Studio
          interface.
        </p>

        <p className="my-4">Please follow the code instructions below:</p>

        <pre className="bg-muted overflow-hidden rounded shadow">
          <div
            className={highlightClassName}
          >{`import { Browsable, studio } from "@outerbase/browsable-durable-object";`}</div>
          <div> </div>
          <div className={highlightClassName}>{`@Browsable()`}</div>
          <div className="px-2 py-0.5">{`export class MyDurableObject extends DurableObject<Env> {}`}</div>
          <div> </div>
          <div className="px-2 py-0.5">{`export default {`}</div>
          <div className="px-2 py-0.5">{`  async fetch(request, env, ctx): Promise<Response> {`}</div>
          <div
            className={highlightClassName}
          >{`    const url = new URL(request.url);`}</div>
          <div
            className={highlightClassName}
          >{`    if (url.pathname === '/__studio') {`}</div>
          <div
            className={highlightClassName}
          >{`      return await studio(request, env.MY_DURABLE_OBJECT, {`}</div>
          <div
            className={highlightClassName}
          >{`        basicAuth: { username: 'admin', password: 'password' }`}</div>
          <div className={highlightClassName}>{`      });`}</div>
          <div className={highlightClassName}>{`    }`}</div>
          <div className="px-2 py-0.5">{`    // your other code ...`}</div>
          <div className="px-2 py-0.5">{`} satisfies ExportedHandler<Env>;`}</div>
        </pre>
      </div>
    </div>
  );
}
