import { useCommonDialog } from "@/components/common-dialog";
import OpacityLoading from "@/components/gui/loading-opacity";
import { useStudioContext } from "@/context/driver-provider";
import { useSchema } from "@/context/schema-provider";
import { DatabaseViewSchema } from "@/drivers/base-driver";
import { produce } from "immer";
import { isEqual } from "lodash";
import { LucideLoader, LucideSave } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { viewEditorExtensionTab } from ".";
import { ViewController } from "./view-controller";
import ViewEditor from "./view-editor";

export interface ViewTabProps {
  name: string;
  schemaName?: string;
}

const EMPTY_DEFAULT_VIEW: DatabaseViewSchema = {
  name: "",
  statement: "",
  schemaName: "",
};

export default function ViewTab(props: ViewTabProps) {
  const { showDialog } = useCommonDialog();
  const { refresh: refreshSchema, currentSchemaName } = useSchema();
  const { databaseDriver } = useStudioContext();

  // If name is specified, it means the trigger is already exist
  const [loading, setLoading] = useState(!!props.name);

  // Loading the inital value
  const [initialValue, setInitialValue] = useState<DatabaseViewSchema>(() => {
    return produce(EMPTY_DEFAULT_VIEW, (draft) => {
      draft.schemaName = props.schemaName ?? currentSchemaName ?? "";
    });
  });
  const [value, setValue] = useState<DatabaseViewSchema>(initialValue);
  const [isExecuting, setIsExecuting] = useState(false);

  const hasChanged = !isEqual(initialValue, value);

  const previewScript = useMemo(() => {
    const drop = databaseDriver.dropView(value.schemaName, props.name);
    const create = databaseDriver.createView(value);
    return props.name ? [drop, create] : [create];
  }, [value, databaseDriver, props.name]);

  // Loading the view
  useEffect(() => {
    if (props.schemaName && props.name) {
      databaseDriver
        .view(props.schemaName, props.name)
        .then((viewValue) => {
          setValue(viewValue);
          setInitialValue(viewValue);
        })
        .finally(() => setLoading(false));
    }
  }, [props.name, props.schemaName, databaseDriver]);

  const onContinue = useCallback(async () => {
    setIsExecuting(true);
    if (
      value.schemaName !== currentSchemaName &&
      databaseDriver.getFlags().supportUseStatement
    ) {
      const oldSchemaName = currentSchemaName;
      await databaseDriver.query(
        "USE " + databaseDriver.escapeId(value.schemaName)
      );
      await databaseDriver.transaction(previewScript);
      if (oldSchemaName !== "") {
        await databaseDriver.query(
          "USE " + databaseDriver.escapeId(oldSchemaName)
        );
      }
    } else {
      await databaseDriver.transaction(previewScript);
    }
  }, [currentSchemaName, databaseDriver, previewScript, value.schemaName]);

  const onSave = useCallback(() => {
    showDialog({
      title: props.name ? "Edit View" : "Create View",
      content: <p>Are you sure you want to run this change?</p>,
      previewCode: previewScript.join(";\n"),
      actions: [
        {
          text: "Continue",
          icon: isExecuting ? LucideLoader : LucideSave,
          onClick: onContinue,
          onComplete: () => {
            refreshSchema();

            viewEditorExtensionTab.replace({
              schemaName: value.schemaName,
              name: value.name,
            });

            setIsExecuting(false);
          },
        },
      ],
    });
  }, [
    showDialog,
    props.name,
    previewScript,
    isExecuting,
    onContinue,
    refreshSchema,
    value.name,
    value.schemaName,
  ]);

  if (loading) {
    return <OpacityLoading />;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <ViewController
        onSave={onSave}
        onDiscard={() => {
          setValue(initialValue);
        }}
        disabled={!hasChanged}
        previewScript={previewScript.join(";\n")}
      />
      <ViewEditor value={value} onChange={setValue} />
    </div>
  );
}
