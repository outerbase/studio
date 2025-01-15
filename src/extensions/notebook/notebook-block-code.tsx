import { useMemo, useState } from "react";
import { NotebookEditorBlockValue } from "./notebook-editor";
import { NotebookVM } from "./notebook-vm";
import JavascriptEditor from "@/components/editor/javascript-editor";
import { Button } from "@/components/ui/button";
import { PlayIcon, Terminal } from "lucide-react";
import { produce } from "immer";

interface OutputFormat {
  type: "log";
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
  }, []);

  if (content.length > 500) {
    return (
      <span className="mr-2 text-blue-500 font-bold">[Output too long]</span>
    );
  }

  return <span className="mr-2">{content}</span>;
}

function OutputItem({ value }: { value: OutputFormat }) {
  return (
    <div>
      <pre>
        {value.args.map((argValue, argIndex) => (
          <OutputArgItem value={argValue} key={argIndex} />
        ))}
      </pre>
    </div>
  );
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
  const [output, setOutput] = useState<OutputFormat[]>([]);

  const onRunClick = () => {
    setOutput([]);
    vm.run(value.value, {
      complete: () => {
        console.log("Complete");
      },
      stdOut: (data: any) => {
        setOutput((prev) => [...prev, data]);
      },
      stdErr: () => {
        console.log("Error");
      },
    });
  };

  const onClearLogClick = () => {
    setOutput([]);
  };

  return (
    <div className="flex-1 flex flex-col p-3 gap-2">
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

      <div>
        {output.map((outputContent, outIdx) => (
          <OutputItem key={outIdx} value={outputContent} />
        ))}
      </div>
    </div>
  );
}
