"use client";

import { LOCAL_CONNECTION_TEMPLATES } from "@/app/(outerbase)/base-template";
import {
  CommonConnectionConfig,
  ConnectionConfigEditor,
} from "@/components/connection-config-editor";
import { Button } from "@/components/orbit/button";
import { getDatabaseFriendlyName } from "@/components/resource-card/utils";
import { ArrowLeft, ArrowRight, FloppyDisk } from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function LocalNewBasePage() {
  const { driver } = useParams<{ driver: string }>();
  const [value, setValue] = useState<CommonConnectionConfig>({ name: "" });

  const template = LOCAL_CONNECTION_TEMPLATES[driver];

  if (!template) {
    return <div>Invalid driver</div>;
  }

  return (
    <>
      <div className="container">
        <div className="my-8 flex">
          <Button variant="secondary" size="lg" href="/local" as="link">
            <ArrowLeft />
            Back
          </Button>

          <div className="flex-1"></div>
        </div>

        <div className="mb-8 text-2xl font-bold">
          <div>Connect to {getDatabaseFriendlyName(driver)} database</div>
        </div>

        <div>
          <div className="w-1/2">
            <ConnectionConfigEditor
              template={template.template}
              value={value}
              onChange={setValue}
            />
          </div>
          <div></div>
        </div>
      </div>

      <div className="bg-background sticky bottom-0 mt-12 border-t px-2 py-6">
        <div className="container flex gap-3">
          <Button variant="primary" size="lg">
            <ArrowRight />
            Connect
          </Button>
          <Button variant="secondary" size="lg">
            <FloppyDisk />
            Save
          </Button>
          <Button variant="secondary" size="lg">
            <ArrowRight />
            Test
          </Button>
        </div>
      </div>
    </>
  );
}
