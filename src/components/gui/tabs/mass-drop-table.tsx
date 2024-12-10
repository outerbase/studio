import { SelectableTable } from "@/components/selectable-table";
import { useSchema } from "@/context/schema-provider";
import { DatabaseSchemaItem } from "@/drivers/base-driver";
import { Check, Spinner, Table, Trash, XCircle } from "@phosphor-icons/react";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { Toolbar, ToolbarButton } from "../toolbar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDatabaseDriver } from "@/context/driver-provider";

function ConfirmDialog({
  selectedItems,
  onClose,
  onConfirm,
}: {
  selectedItems: DatabaseSchemaItem[];
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");

  return (
    <Dialog
      open
      onOpenChange={(openState) => {
        if (!openState) onClose();
      }}
    >
      <DialogContent>
        <DialogTitle>Are you sure?</DialogTitle>

        <div className="text-sm">
          You are about to drop the following tables.
          <div className="font-mono gap-2 flex flex-wrap my-2">
            {selectedItems.map((t) => (
              <div className="p-1 bg-muted rounded" key={t.name}>
                {t.name}
              </div>
            ))}
          </div>
          <p className="text-2xl text-primary font-serif my-2 mt-8">
            ln(x) + e<sup>x-1</sup> - cos(x) = 0
          </p>
          <p className="my-2">Solve this equaltion or type confirm</p>
          <Input
            className="bg-surface"
            placeholder="Type confirm"
            value={confirmText}
            onKeyDown={(e) => {
              if (e.key === "Enter" && confirmText === "confirm") {
                onConfirm();
              }
            }}
            onChange={(e) => {
              setConfirmText(e.currentTarget.value);
            }}
          />
        </div>

        <DialogFooter>
          <Button
            variant={"destructive"}
            onClick={() => {
              if (confirmText === "confirm") {
                onConfirm();
              }
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MassDropTableTab() {
  const { databaseDriver } = useDatabaseDriver();
  const { schema: initialSchema, currentSchemaName, refresh } = useSchema();
  const [schema] = useState(initialSchema);
  const [selectedSchema] = useState(currentSchemaName);

  const [selectedItems, setSelectedItems] = useState<DatabaseSchemaItem[]>([]);
  const [currentSchema, setCurrentSchema] = useState<DatabaseSchemaItem[]>([]);

  const [itemStatusList, setItemStatusList] = useState<Record<string, string>>(
    {}
  );

  const [operationType, setOperationType] = useState<"drop" | "empty" | null>(
    null
  );

  const [completed, setCompleted] = useState(false);

  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    setSelectedItems([]);
    setCurrentSchema(
      schema[selectedSchema].sort((a, b) => a.name.localeCompare(b.name))
    );
  }, [schema, selectedSchema]);

  const dropSelectedTableClicked = useCallback(() => {
    setIsConfirming(true);
    setOperationType("drop");
  }, []);

  const emptySelectedTableClicked = useCallback(() => {
    setIsConfirming(true);
    setOperationType("empty");
  }, []);

  const performOperation = useCallback(
    async (items: DatabaseSchemaItem[]) => {
      if (!operationType) return;

      let statusList: Record<string, string> = {};

      for (const item of items) {
        if (operationType === "drop") {
          try {
            statusList = { ...statusList, [item.name]: "Dropping..." };
            setItemStatusList(statusList);

            await databaseDriver.dropTable(currentSchemaName, item.name);

            statusList = { ...statusList, [item.name]: "Dropped" };
            setItemStatusList(statusList);
          } catch {
            statusList = { ...statusList, [item.name]: "Failed" };
            setItemStatusList(statusList);
          }
        } else if (operationType === "empty") {
          try {
            statusList = { ...statusList, [item.name]: "Emptying..." };
            setItemStatusList(statusList);

            await databaseDriver.emptyTable(currentSchemaName, item.name);

            statusList = { ...statusList, [item.name]: "Emptied" };
            setItemStatusList(statusList);
          } catch {
            statusList = { ...statusList, [item.name]: "Failed" };
            setItemStatusList(statusList);
          }
        }
      }

      setCompleted(true);
      refresh();
    },
    [operationType, currentSchemaName, databaseDriver, refresh]
  );

  // How to render each row in the table
  const renderRowHandler = useCallback(
    (t: DatabaseSchemaItem) => {
      const status = itemStatusList[t.name] || "";
      let statusIcon: ReactElement | null = null;

      if (status === "Failed")
        statusIcon = (
          <XCircle size={16} className="text-red-500 mr-2 inline-block" />
        );
      else if (status.includes("..."))
        statusIcon = (
          <Spinner size={16} className="mr-2 animate-spin inline-block" />
        );
      else if (status === "Dropped" || status === "Emptied")
        statusIcon = (
          <Check size={16} className="text-green-500 mr-2 inline-block" />
        );

      return (
        <>
          <td className="py-2 px-2 h-[40px] w-[300px] border-b">
            <Table size={16} className="mr-2 inline-block" />
            {t.name}
          </td>
          <td className="py-2 px-2 h-[40px] w-[100px] border-b capitalize">
            {t.type}
          </td>
          <td className="py-2 px-2 h-[40px] border-b">
            {statusIcon}
            {status}
          </td>
        </>
      );
    },
    [itemStatusList]
  );

  const extractItemKey = useCallback((t: DatabaseSchemaItem) => t.name, []);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {isConfirming && (
        <ConfirmDialog
          selectedItems={selectedItems}
          onClose={() => {
            setIsConfirming(false);
            setOperationType(null);
          }}
          onConfirm={() => {
            setIsConfirming(false);
            performOperation(selectedItems);
          }}
        />
      )}

      <div className="border-b pb-1">
        <h1 className="text-lg font-semibold text-primary p-4 mb-1 border-b">
          Drop & Empty Multiple Tables
        </h1>

        <div className="px-1">
          <Toolbar>
            <ToolbarButton
              disabled={selectedItems.length === 0 || completed}
              icon={<Trash size={16} className="text-red-500" />}
              text="Drop Selected Table"
              onClick={dropSelectedTableClicked}
              destructive
            />
            <ToolbarButton
              text="Empty Selected Table"
              disabled={selectedItems.length === 0 || completed}
              onClick={emptySelectedTableClicked}
              destructive
            />
          </Toolbar>
        </div>
      </div>

      <div className="flex-1 overflow-scroll relative">
        <SelectableTable
          headers={[
            { key: "name", text: "Name", width: "300px" },
            { key: "type", text: "Type", width: "100px" },
            { key: "status", text: "" },
          ]}
          items={currentSchema}
          extractKey={extractItemKey}
          renderRow={renderRowHandler}
          selectedItems={selectedItems}
          onSelectedItemChanged={setSelectedItems}
          forceShowSelectedItem={!isConfirming && !!operationType}
          disabledSelection={!isConfirming && !!operationType}
        />
      </div>
    </div>
  );
}
