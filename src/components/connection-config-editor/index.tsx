/**
 * This component offers a versatile solution for managing connection configurations
 * across various drivers. It supports storing configurations in multiple locations,
 * such as cloud storage, local storage, and potentially other future storage options.
 * By utilizing this component, we eliminate the need to duplicate code for each
 * connection configuration editor for different drivers.
 *
 * It operates by taking templates and providing the appropriate interface for the user.
 * Users can customize the templates to suit their specific requirements.
 */

import { cn } from "@/lib/utils";
import { produce } from "immer";
import { Input } from "../orbit/input";
import { Label } from "../orbit/label";
import { Textarea } from "../ui/textarea";

export function ConnectionConfigEditor({
  template,
  onChange,
  value,
}: ConnectionConfigEditorProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <Label title="Name">
        <Input
          size="lg"
          placeholder="Connection name"
          value={value.name}
          onChange={(e) => {
            onChange(
              produce(value, (draft) => {
                draft.name = e.target.value as never;
              })
            );
          }}
        />
      </Label>

      {template.map((row, index) => {
        return (
          <div key={index} className={"flex flex-row gap-4"}>
            {row.columns.map((column, index) => {
              let content = <div />;

              if (column.type === "text" || column.type === "password") {
                content = (
                  <Label title={column.label} required={column.required}>
                    <Input
                      size="lg"
                      placeholder={column.placeholder}
                      value={(value[column.name] as string) ?? ""}
                      onChange={(e) => {
                        onChange(
                          produce(value, (draft) => {
                            draft[column.name] = e.target.value as never;
                          })
                        );
                      }}
                    />
                  </Label>
                );
              } else if (column.type === "textarea") {
                content = (
                  <Label title={column.label} required={column.required}>
                    <Textarea
                      className="resize-none"
                      placeholder={column.placeholder}
                      value={(value[column.name] as string) ?? ""}
                      onChange={(e) => {
                        onChange(
                          produce(value, (draft) => {
                            draft[column.name] = e.target.value as never;
                          })
                        );
                      }}
                    />
                  </Label>
                );
              } else if (column.type === "checkbox") {
                content = (
                  <label className="mx-1 flex flex-1 gap-2 text-base select-none">
                    <input type="checkbox" checked className="scale-125" />
                    {column.label}
                  </label>
                );
              }

              return (
                <div key={index} className={cn("flex-1", column.size)}>
                  {content}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export interface CommonConnectionConfig {
  name: string;

  username?: string;
  password?: string;
  token?: string;
  host?: string;
  port?: string;
  database?: string;

  ssl?: boolean;

  // Primarily used for loading the SQLite database file
  // from the browser using the File System Access API
  filehandler?: string;
}

interface CommonConnectionConfigColumn {
  name: keyof CommonConnectionConfig;
  label: string;
  type: "text" | "password" | "file" | "textarea" | "checkbox";
  required?: boolean;
  placeholder?: string;
  size?: string;
}

type CommonConnectionConfigTemplateRow = {
  columns: CommonConnectionConfigColumn[];
};

export type CommonConnectionConfigTemplate =
  CommonConnectionConfigTemplateRow[];

interface ConnectionConfigEditorProps {
  template: CommonConnectionConfigTemplate;
  value: CommonConnectionConfig;
  onChange: (value: CommonConnectionConfig) => void;
}
