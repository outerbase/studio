"use client";
import {
  ConnectionTemplateList,
  LOCAL_CONNECTION_TEMPLATES,
} from "@/app/(outerbase)/base-template";
import { SavedConnectionRawLocalStorage } from "@/app/(theme)/connect/saved-connection-storage";
import {
  CommonConnectionConfig,
  ConnectionConfigEditor,
} from "@/components/connection-config-editor";
import { Button } from "@/components/orbit/button";
import { ArrowLeft, ArrowRight, FloppyDisk } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getLocalConnection, updateLocalConnection } from "../../hooks";

export default function LocalEditBasePage() {
  const router = useRouter();
  const { baseId } = useParams<{ baseId: string }>();
  const [value, setValue] = useState<CommonConnectionConfig>({ name: "" });
  const [loading, setLoading] = useState(true);
  const [databaseName, setDatabaseName] = useState("");
  const [template, setTemplate] =
    useState<ConnectionTemplateList<SavedConnectionRawLocalStorage>>();

  const onSave = useCallback(async () => {
    if (!template) return;
    await updateLocalConnection(baseId, template.to(value));
    router.push("/local");
  }, [template, value, router, baseId]);

  const onConnect = useCallback(async () => {
    if (!template) return;
    setLoading(true);
    const tmp = await updateLocalConnection(baseId, template.to(value));
    router.push(
      tmp?.content.driver === "sqlite-filehandler"
        ? `/playground/client?s=${tmp?.content.id}`
        : `/client/s/${tmp?.content.driver ?? "turso"}?p=${tmp?.content.id}`
    );
  }, [template, value, router, baseId]);

  // Loading the base
  useEffect(() => {
    getLocalConnection(baseId).then((config) => {
      if (!config) return;

      // Check for the template
      const template = LOCAL_CONNECTION_TEMPLATES[config.content.driver ?? ""];
      if (!template) return;

      setDatabaseName(config.content.name ?? "");
      setTemplate(template);
      setValue(template.from(config.content));
      setLoading(false);
    });
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
