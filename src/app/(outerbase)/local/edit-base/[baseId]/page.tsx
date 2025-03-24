"use client";
import { ConnectionTemplateList } from "@/app/(outerbase)/base-template";
import {
  CommonConnectionConfig,
  ConnectionConfigEditor,
  validateTemplate,
} from "@/components/connection-config-editor";
import { ConnectionTemplateDictionary } from "@/components/connection-config-editor/template";
import { Button } from "@/components/orbit/button";
import { ArrowLeft, ArrowRight, FloppyDisk } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getLocalConnection, updateLocalConnection } from "../../hooks";

export const runtime = "edge";

export default function LocalEditBasePage() {
  const router = useRouter();
  const { baseId } = useParams<{ baseId: string }>();
  const [value, setValue] = useState<CommonConnectionConfig>({ name: "" });
  const [loading, setLoading] = useState(true);
  const [databaseName, setDatabaseName] = useState("");
  const [template, setTemplate] = useState<ConnectionTemplateList>();
  const [validateErrors, setValidateErrors] = useState<Record<string, string>>(
    {}
  );

  const onSave = useCallback(async () => {
    if (!template?.localTo) return;

    const errors = validateTemplate(value, template);
    setValidateErrors(errors);
    if (Object.keys(errors).length > 0) return;

    await updateLocalConnection(baseId, template.localTo(value));
    router.push("/local");
  }, [template, value, router, baseId]);

  const onConnect = useCallback(async () => {
    if (!template?.localTo) return;

    const errors = validateTemplate(value, template);
    setValidateErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const tmp = await updateLocalConnection(baseId, template.localTo(value));
    router.push(
      tmp?.content.driver === "sqlite-filehandler"
        ? `/playground/client?s=${tmp?.content.id}`
        : `/client/s/${tmp?.content.driver ?? "turso"}?p=${baseId}`
    );
  }, [template, value, router, baseId]);

  // Loading the base
  useEffect(() => {
    getLocalConnection(baseId).then((config) => {
      if (!config) return;

      // Check for the template
      const template =
        ConnectionTemplateDictionary[config.content.driver ?? ""];
      if (!template?.localFrom) return;

      setDatabaseName(config.content.name ?? "");
      setTemplate(template);
      setValue(template.localFrom(config.content));
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

        <ConnectionConfigEditor
          template={template}
          value={value}
          onChange={setValue}
          errors={validateErrors}
        />
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
