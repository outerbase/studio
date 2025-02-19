"use client";

import { LOCAL_CONNECTION_TEMPLATES } from "@/app/(outerbase)/base-template";
import { SavedConnectionLocalStorage } from "@/app/(theme)/connect/saved-connection-storage";
import {
  CommonConnectionConfig,
  ConnectionConfigEditor,
} from "@/components/connection-config-editor";
import { Button } from "@/components/orbit/button";
import { getDatabaseFriendlyName } from "@/components/resource-card/utils";
import { ArrowLeft, ArrowRight, FloppyDisk } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { mutate } from "swr";

export default function LocalNewBasePage() {
  const { driver } = useParams<{ driver: string }>();
  const router = useRouter();
  const [value, setValue] = useState<CommonConnectionConfig>({ name: "" });
  const [loading, setLoading] = useState(false);

  const template = useMemo(() => {
    return LOCAL_CONNECTION_TEMPLATES[driver];
  }, [driver]);

  const onSave = useCallback(() => {
    setLoading(true);
    SavedConnectionLocalStorage.save({
      storage: "local",
      ...template.to(value),
    });

    // Redirect to the connection page
    mutate("/local/bases");
    router.push("/local");
  }, [template, value, router]);

  const onConnect = useCallback(() => {
    setLoading(true);
    const tmp = SavedConnectionLocalStorage.save({
      storage: "local",
      ...template.to(value),
    });

    // Redirect to the connection page
    mutate("/local/bases");
    router.push(
      tmp.driver === "sqlite-filehandler"
        ? `/playground/client?s=${tmp.id}`
        : `/client/s/${tmp.driver ?? "turso"}?p=${tmp.id}`
    );
  }, [template, value, router]);

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
          <Button
            variant="primary"
            size="lg"
            onClick={onConnect}
            disabled={loading}
          >
            <ArrowRight />
            Connect
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={onSave}
            disabled={loading}
          >
            <FloppyDisk />
            Save
          </Button>
        </div>
      </div>
    </>
  );
}
