"use client";
import { ConnectionTemplateList } from "@/app/(outerbase)/base-template";
import {
  CommonConnectionConfig,
  ConnectionConfigEditor,
  validateTemplate,
} from "@/components/connection-config-editor";
import { ConnectionTemplateDictionary } from "@/components/connection-config-editor/template";
import { Button } from "@/components/orbit/button";
import { Loader } from "@/components/orbit/loader";
import {
  OuterbaseAPIBase,
  OuterbaseAPISourceInput,
} from "@/outerbase-cloud/api-type";
import { updateOuterbaseSource } from "@/outerbase-cloud/api-workspace";
import {
  useOuterbaseBase,
  useOuterbaseBaseCredential,
} from "@/outerbase-cloud/hook";
import { ArrowLeft, ArrowRight, FloppyDisk } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export const runtime = "edge";

function WorkspaceEditBaseBody({
  base,
  credential,
  template,
}: {
  base: OuterbaseAPIBase;
  credential: OuterbaseAPISourceInput;
  template: ConnectionTemplateList;
}) {
  const router = useRouter();
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const [value, setValue] = useState<CommonConnectionConfig>(() => {
    if (!template.remoteFrom) throw new Error("Invalid driver");

    return template.remoteFrom({
      source: credential,
      name: base.name,
    });
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validateErrors, setValidateErrors] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {});

  const onSave = useCallback(
    (overrideRedirect?: string) => {
      if (!template.remoteFrom || !template.remoteTo) return;

      const errors = validateTemplate(value, template);
      setValidateErrors(errors);
      if (Object.keys(errors).length > 0) return;

      setLoading(true);
      setError("");

      const { source } = template.remoteTo(value);

      const runSave = async () => {
        await updateOuterbaseSource(
          workspaceId,
          base.sources[0]?.id ?? "",
          source
        );

        router.replace(
          overrideRedirect ?? `/w/${workspaceId}/${base.short_name}`
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
    [workspaceId, template, value, router, base]
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
          <div>Editing {base.name} base</div>
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

export default function WorkspaceEditBasePage() {
  const { workspaceId, baseId } = useParams<{
    baseId: string;
    workspaceId: string;
  }>();

  const { isLoading: isBaseLoading, data: base } = useOuterbaseBase(
    workspaceId,
    baseId
  );

  const { isLoading: isCredentialLoading, data: credential } =
    useOuterbaseBaseCredential(workspaceId, base?.sources[0]?.id ?? "");

  const template = useMemo(() => {
    if (!credential) return null;
    return ConnectionTemplateDictionary[credential.type];
  }, [credential]);

  if (isBaseLoading || isCredentialLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader size={60} />
      </div>
    );
  }

  if (!template) {
    return <div>Unknown driver</div>;
  }

  if (!credential || !base) {
    return <div>Fill to get credential</div>;
  }

  return (
    <WorkspaceEditBaseBody
      template={template}
      credential={credential}
      base={base}
    />
  );
}
