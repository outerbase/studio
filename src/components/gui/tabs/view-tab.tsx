import { useCallback, useEffect, useMemo, useState } from "react";
import ViewEditor from "../view-editor";
import { DatabaseViewSchema } from "@/drivers/base-driver";
import { produce } from "immer";
import { ViewController } from "../view-editor/view-controller";
import { isEqual } from "lodash";
import { useDatabaseDriver } from "@/context/driver-provider";
import { useCommonDialog } from "@/components/common-dialog";
import { LucideLoader, LucideSave, LucideView } from "lucide-react";
import { useSchema } from "@/context/schema-provider";
import { useTabsContext } from "../windows-tab";
import OpacityLoading from "../loading-opacity";

export interface ViewTabProps {
  name: string;
  tableName?: string;
  schemaName: string;
}

const EMPTY_DEFAULT_VIEW: DatabaseViewSchema = {
  name: "",
  statement: "",
  schemaName: "",
};

export default function ViewTab(props: ViewTabProps) {
  const { showDialog } = useCommonDialog();
  const { replaceCurrentTab } = useTabsContext();
  const { refresh: refreshSchema } = useSchema();
  const { databaseDriver } = useDatabaseDriver();

  // If name is specified, it means the trigger is already exist
  const [loading, setLoading] = useState(!!props.name);

  // Loading the inital value
  const [initialValue, setInitialValue] = useState<DatabaseViewSchema>(() => {
    return produce(EMPTY_DEFAULT_VIEW, (draft) => {
      draft.schemaName = props.schemaName ?? "";
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
    await databaseDriver.transaction(previewScript);
  }, [databaseDriver, previewScript]);

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
            replaceCurrentTab({
              component: (
                <ViewTab
                  tableName={props.tableName}
                  name={value.name}
                  schemaName={value.schemaName}
                />
              ),
              key: "view-" + value.name || "",
              identifier: "view-" + value.name || "",
              title: value.name || "",
              icon: LucideView,
            });
            setIsExecuting(false);
          },
        },
      ],
    });
  }, [
    showDialog,
    props.name,
    props.tableName,
    previewScript,
    isExecuting,
    onContinue,
    refreshSchema,
    replaceCurrentTab,
    value.name,
    value.schemaName,
  ]);

  if (loading) {
    return <OpacityLoading />;
  }

  return (
    <div className="flex flex-col overflow-hidden w-full h-full">
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
