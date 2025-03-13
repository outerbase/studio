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

import { ConnectionTemplateList } from "@/app/(outerbase)/base-template";
import { cn } from "@/lib/utils";
import { produce } from "immer";
import { CommonDialogProvider } from "../common-dialog";
import FileHandlerPicker from "../filehandler-picker";
import { Input } from "../orbit/input";
import { Label } from "../orbit/label";
import { MenuBar } from "../orbit/menu-bar";
import { Toggle } from "../orbit/toggle";
import { Textarea } from "../ui/textarea";

export function validateTemplate(
  value: CommonConnectionConfig,
  template: ConnectionTemplateList
): Record<string, string> {
  const templateRow = template.template;

  const validationErrors: Record<string, string> = {};

  if (!value.name) {
    validationErrors["name"] = "Name is required";
  }

  for (const row of templateRow) {
    for (const column of row.columns) {
      if (column.required && !value[column.name]) {
        validationErrors[column.name] = `${column.label} is required`;
      }
    }
  }

  return validationErrors;
}

export function ConnectionConfigEditor({
  template,
  onChange,
  value,
  errors,
}: ConnectionConfigEditorProps) {
  const templateRow = template.template;

  return (
    <div className="flex w-full gap-4">
      <div className="flex w-1/2 grow-0 flex-col gap-4">
        <Label title="Name" requiredDescription={errors?.["name"]} required>
          <Input
            autoFocus
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

        {templateRow.map((row, index) => {
          return (
            <div key={index} className={"flex flex-row gap-4"}>
              {row.columns.map((column, index) => {
                let content = <div />;

                if (column.type === "text" || column.type === "password") {
                  content = (
                    <Label
                      title={column.label}
                      required={column.required}
                      requiredDescription={errors?.[column.name]}
                    >
                      <Input
                        size="lg"
                        type={column.type}
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
                    <Label
                      title={column.label}
                      required={column.required}
                      requiredDescription={errors?.[column.name]}
                    >
                      <Textarea
                        rows={4}
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
                    <label className="mx-1 flex flex-1 items-center justify-start gap-2 text-base select-none">
                      <Toggle
                        size="sm"
                        onChange={(checked) => {
                          onChange(
                            produce(value, (draft) => {
                              draft[column.name] = checked as never;
                            })
                          );
                        }}
                        toggled={!!value[column.name]}
                      />

                      {column.label}
                    </label>
                  );
                } else if (column.type === "file") {
                  content = (
                    <Label
                      title={column.label}
                      required={column.required}
                      requiredDescription={errors?.[column.name]}
                    >
                      <div>
                        <CommonDialogProvider>
                          <FileHandlerPicker
                            value={value[column.name] as string}
                            onChange={(fileId) => {
                              onChange(
                                produce(value, (draft) => {
                                  draft[column.name] = fileId as never;
                                })
                              );
                            }}
                          />
                        </CommonDialogProvider>
                      </div>
                    </Label>
                  );
                } else if (
                  column.type === "options" &&
                  column.options &&
                  column.options.length > 0
                ) {
                  return (
                    <div key={column.name}>
                      <MenuBar
                        value={value["starbase_type"] ?? ""}
                        items={column.options}
                        onChange={(e) => {
                          onChange(
                            produce(value, (draft) => {
                              draft[column.name] = e as never;
                            })
                          );
                        }}
                      />
                    </div>
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

      <div className="w-1/2 grow-0">{template.instruction}</div>
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

  // Starbase specified configuration
  starbase_type?: string;
}

interface CommonConnectionConfigColumn {
  name: keyof CommonConnectionConfig;
  label: string;
  type: "text" | "password" | "file" | "textarea" | "checkbox" | "options";
  options?: { value: string; content: string }[];
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
  template: ConnectionTemplateList;
  value: CommonConnectionConfig;
  onChange: (value: CommonConnectionConfig) => void;
  errors?: Record<string, string>;
}
