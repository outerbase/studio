"use client";
import {
  ConnectionTemplateList,
  LOCAL_CONNECTION_TEMPLATES,
} from "@/app/(outerbase)/base-template";
import {
  SavedConnectionItemConfig,
  SavedConnectionLocalStorage,
} from "@/app/(theme)/connect/saved-connection-storage";
import {
  CommonConnectionConfig,
  ConnectionConfigEditor,
} from "@/components/connection-config-editor";
import { Button } from "@/components/orbit/button";
import { ArrowLeft, ArrowRight, FloppyDisk } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { mutate } from "swr";

export default function LocalEditBasePage() {
  const router = useRouter();
  const { baseId } = useParams<{ baseId: string }>();
  const [value, setValue] = useState<CommonConnectionConfig>({ name: "" });
  const [loading, setLoading] = useState(true);
  const [databaseName, setDatabaseName] = useState("");
  const [template, setTemplate] =
    useState<ConnectionTemplateList<SavedConnectionItemConfig>>();

  const onSave = useCallback(() => {
    if (!template) return;

    SavedConnectionLocalStorage.update(baseId, template.to(value));

    // Redirect to the connection page
    mutate("/local/bases");
    router.push("/local");
  }, [template, value, router, baseId]);

  const onConnect = useCallback(() => {
    if (!template) return;

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

  // Loading the base
  useEffect(() => {
    const config = SavedConnectionLocalStorage.get(baseId);

    if (!config) return;

    // Check for the template
    const template = LOCAL_CONNECTION_TEMPLATES[config.driver ?? ""];
    if (!template) return;

    setDatabaseName(config.name ?? "");
    setTemplate(template);
    setValue(template.from(config));
    setLoading(false);
  }, [baseId]);

  if (loading || !template) return <div>Loading....</div>;

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

        <div className="mb-8 text-2xl">
          <div>
            Edit <strong>{databaseName}</strong>
          </div>
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
          <Button variant="primary" size="lg" onClick={onConnect}>
            <ArrowRight />
            Connect
          </Button>
          <Button variant="secondary" size="lg" onClick={onSave}>
            <FloppyDisk />
            Save
          </Button>
        </div>
      </div>
    </>
  );
}
