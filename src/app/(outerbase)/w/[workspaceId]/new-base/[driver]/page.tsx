"use client";
import {
  CommonConnectionConfig,
  ConnectionConfigEditor,
  validateTemplate,
} from "@/components/connection-config-editor";
import { ConnectionTemplateDictionary } from "@/components/connection-config-editor/template";
import { Button } from "@/components/orbit/button";
import { getDatabaseFriendlyName } from "@/components/resource-card/utils";
import {
  createOuterbaseBase,
  createOuterbaseConnection,
  createOuterbaseSource,
  testOuterbaseSource,
} from "@/outerbase-cloud/api-workspace";
import { ArrowLeft, ArrowRight, FloppyDisk } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export const runtime = "edge";

export default function WorkspaceNewBasePage() {
  const { driver, workspaceId } = useParams<{
    driver: string;
    workspaceId: string;
  }>();
  const router = useRouter();
  const [value, setValue] = useState<CommonConnectionConfig>({ name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validateErrors, setValidateErrors] = useState<Record<string, string>>(
    {}
  );

  const template = useMemo(() => {
    return ConnectionTemplateDictionary[driver];
  }, [driver]);

  const onSave = useCallback(
    (overrideRedirect?: string) => {
      if (!template.remoteFrom || !template.remoteTo) return;

      const errors = validateTemplate(value, template);
      setValidateErrors(errors);
      if (Object.keys(errors).length > 0) return;

      setLoading(true);
      setError("");

      const { name: baseName, source } = template.remoteTo(value);

      const runSave = async () => {
        await testOuterbaseSource(workspaceId, source);
        const baseResponse = await createOuterbaseBase(workspaceId, baseName);
        const connResponse = await createOuterbaseConnection(
          workspaceId,
          baseResponse.id,
          baseName
        );

        await createOuterbaseSource(workspaceId, {
          ...source,
          base_id: baseResponse.id,
          connection_id: connResponse.id,
        });

        router.replace(
          overrideRedirect ?? `/w/${workspaceId}/${baseResponse.short_name}`
        );
      };

      runSave()
        .then()
        .catch((e) => {
          if (e instanceof Error) {
            setError(e.message);
          } else {
            setError(e.toString());
          }
        })
        .finally(() => setLoading(false));
    },
    [workspaceId, template, value, router]
  );

  if (!template.remoteFrom || !template.remoteTo) {
    return <div>Invalid driver</div>;
  }

  return (
    <>
      <div className="container">
        <div className="my-8 flex">
          <Button
            variant="secondary"
            size="lg"
            href={`/w/${workspaceId}`}
            as="link"
          >
            <ArrowLeft />
            Back
          </Button>

          <div className="flex-1"></div>
        </div>

        <div className="mb-8 text-2xl font-bold">
          <div>Connect to {getDatabaseFriendlyName(driver)} database</div>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-500 bg-red-100 p-2 text-base lg:w-1/2 dark:bg-red-500 dark:text-white">
            {error}
          </div>
        )}

        <ConnectionConfigEditor
          template={template}
          value={value}
          onChange={setValue}
          errors={validateErrors}
        />
      </div>

      <div className="bg-background sticky bottom-0 mt-12 border-t px-2 py-6">
        <div className="container flex gap-3">
          <Button
            loading={loading}
            variant="primary"
            size="lg"
            onClick={() => onSave()}
            disabled={loading}
          >
            <ArrowRight />
            Connect
          </Button>

          <Button
            loading={loading}
            variant="secondary"
            size="lg"
            onClick={() => onSave(`/w/${workspaceId}`)}
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
