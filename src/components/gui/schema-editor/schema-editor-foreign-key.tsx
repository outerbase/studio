import { DatabaseTableConstraintChange } from "@/drivers/base-driver";
import ConstraintForeignKeyEditor from "./constraint-foreign-key";

interface Props {
  selectedColumns: Set<string>;
  value?: DatabaseTableConstraintChange[];
}

export function SchemaEditorForeignKey(props: Props) {
  return (
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
                  <ConstraintForeignKeyEditor value={x} onChange={() => {}} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
