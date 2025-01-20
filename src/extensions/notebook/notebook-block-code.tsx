import { useMemo, useState } from "react";
import { NotebookEditorBlockValue } from "./notebook-editor";
import { NotebookVM } from "./notebook-vm";
import JavascriptEditor from "@/components/editor/javascript-editor";
import { Button } from "@/components/ui/button";
import {
  LucideLoader,
  LucideShieldAlert,
  LucideTerminal,
  PlayIcon,
  Terminal,
} from "lucide-react";
import { produce } from "immer";
import { cn } from "@/lib/utils";

export interface NotebookOutputFormat {
  id?: string;
  type: "log" | "error" | "query";
  sql?: string;
  queryStatus?: "running" | "success" | "error";
  args: unknown[];
}

function OutputArgItem({ value }: { value: unknown }) {
  const content = useMemo(() => {
    if (typeof value === "object") {
      return JSON.stringify(
        value,
        (_, propValue) => {
          if (typeof propValue === "function") {
            return propValue.toString();
          } else if (typeof propValue === "bigint") {
            return propValue.toString() + "n";
          }

          return propValue;
        },
        2
      );
    }

    return (value ?? "").toString();
  }, [value]);

  if (content.length > 500) {
    return (
      <span className="mr-2 text-blue-500 font-bold">[Output too long]</span>
    );
  }

  return <span className="mr-2">{content}</span>;
}

function OutputItem({ value }: { value: NotebookOutputFormat }) {
  if (value.type === "query") {
    let icon = <LucideLoader className="w-5 h-5 animate-spin" />;
    let color = "";

    if (value.queryStatus === "success") {
      icon = <LucideTerminal className="w-5 h-5" />;
      color = "text-green-600 dark:text-green-400";
    } else if (value.queryStatus === "error") {
      icon = <LucideTerminal className="w-5 h-5" />;
      color = "text-red-400 dark:text-red-300";
    }

    return (
      <div className="flex">
        <div className="w-7">{icon}</div>
        <pre className={"flex-1"}>
          <span className={cn(color, "mr-2")}>⬤</span>
          {value.sql}
        </pre>
      </div>
    );
  } else if (value.type === "error") {
    return (
      <div className="flex text-red-400 dark:text-red-300">
        <div className="w-7">
          <LucideShieldAlert className="w-5 h-5" />
        </div>
        <pre className="flex-1">
          {value.args.map((argValue, argIndex) => (
            <OutputArgItem value={argValue} key={argIndex} />
          ))}
        </pre>
      </div>
    );
  } else {
    return (
      <div className="flex">
        <div className="w-7"></div>
        <pre className="flex-1">
          {value.args.map((argValue, argIndex) => (
            <OutputArgItem value={argValue} key={argIndex} />
          ))}
        </pre>
      </div>
    );
  }
}

export default function NotebookBlockCode({
  value,
  onChange,
  vm,
}: {
  vm: NotebookVM;
  value: NotebookEditorBlockValue;
  onChange: (value: NotebookEditorBlockValue) => void;
}) {
  const [output, setOutput] = useState<NotebookOutputFormat[]>([]);

  const onRunClick = () => {
    setOutput([]);
    vm.run(value.value, {
      complete: () => {
        console.log("Complete");
      },
      stdOut: (data) => {
        if (data.id) {
          setOutput((prev) => [...prev.filter((p) => p.id !== data.id), data]);
        } else {
          setOutput((prev) => [...prev, data]);
        }
      },
    });
  };

  const onClearLogClick = () => {
    setOutput([]);
  };

  return (
    <div className="flex-1 flex flex-col gap-2 mt-4">
      <div className="flex gap-2">
        <Button variant={"outline"} onClick={onRunClick}>
          <PlayIcon className="w-4 h-4 mr-2" /> Run
        </Button>

        <Button variant={"outline"} onClick={onClearLogClick}>
          <Terminal className="w-4 h-4 mr-2" /> Clear Log
        </Button>
      </div>

      <JavascriptEditor
        value={value.value}
        onChange={(e) => {
          onChange(
            produce(value, (draft) => {
              draft.value = e;
            })
          );
        }}
      />

      <div className="flex flex-col gap-1">
        {output.map((outputContent, outIdx) => (
          <OutputItem key={outIdx} value={outputContent} />
        ))}
      </div>
    </div>
  );
}
