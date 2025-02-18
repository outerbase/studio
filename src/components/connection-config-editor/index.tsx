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

export function ConnectionConfigEditor({
  template,
  onChange,
  value,
}: ConnectionConfigEditorProps) {
  return (
    <div>
      {template.map((row, index) => {
        return (
          <div key={index} className={"flex flex-row"}>
            {row.columns.map((column, index) => {
              return (
                <div key={index} className={cn("flex flex-col", column.size)}>
                  <label>{column.label}</label>
                  <input
                    type={column.type}
                    required={column.required}
                    placeholder={column.placeholder}
                  />
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
  required: boolean;
  placeholder?: string;
  size?: string;
}

type CommonConnectionConfigTemplateRow = {
  columns: CommonConnectionConfigColumn[];
};

type CommonConnectionConfigTemplate = CommonConnectionConfigTemplateRow[];

interface ConnectionConfigEditorProps {
  template: CommonConnectionConfigTemplate;
  value?: CommonConnectionConfig;
  onChange: (value: CommonConnectionConfig) => void;
}
