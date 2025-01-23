import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DatabaseTableConstraintChange,
  DatabaseTableSchemaChange,
} from "@/drivers/base-driver";
import { Dispatch, SetStateAction } from "react";
import ConstraintForeignKeyEditor from "./constraint-foreign-key";

interface Props {
  selectedColumns: Set<string>;
  constraints: DatabaseTableConstraintChange[];
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
  onClose: () => void;
}

export function SchemaEditorForeignKey(props: Props) {
  /*return (
    <div className="mx-[-1.5rem]">
      <table className="w-full font-mono">
        <tbody>
          {props.value?.map((x, idx) => {
            return (
              <tr key={x.id}>
                <td className="border-r border-t border-b text-sm text-right bg-muted p-2 align-top">
                  {idx + 1}
                </td>
                <td className="border-r border-t border-b text-sm p-2">
                  <ConstraintForeignKeyEditor
                    value={x}
                    onChange={props.onChange}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );*/

  return (
    <Dialog open onOpenChange={props.onClose}>
      <DialogContent>
        <DialogTitle>Foreign Key</DialogTitle>
        <DialogDescription>
          <div className="mx-[-1.5rem]">
            <table className="w-full font-mono">
              <tbody>
                {props.constraints.map((x, idx) => {
                  return (
                    <tr key={x.id}>
                      <td className="border-r border-t border-b text-sm text-right bg-muted p-2 align-top">
                        {idx + 1}
                      </td>
                      <td className="border-r border-t border-b text-sm p-2">
                        <ConstraintForeignKeyEditor
                          value={x}
                          onChange={props.onChange}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
