import { useImmer } from "use-immer";
import { useDatabaseDriver } from "@/context/driver-provider";
import useNotebookVM from "./notebook-vm";
import NotebookBlockCode from "./notebook-block-code";
import NotebookBlockMarkdown from "./notebook-block-md";
import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
} from "@/components/gui/toolbar";
import { useCallback } from "react";

export interface NotebookEditorBlockValue {
  id: string;
  type: "code" | "markdown";
  value: string;
}

type NotebookEditorValue = NotebookEditorBlockValue[];

export default function NotebookEditor() {
  const { databaseDriver } = useDatabaseDriver();
  const vm = useNotebookVM(databaseDriver);

  const [value, setValue] = useImmer<NotebookEditorValue>([
    {
      id: "initial2",
      type: "markdown",
      value:
        `# Hello World` +
        "\n" +
        `This is the demo notebook editor in Outerbase Studio`,
    },
    {
      id: "initial",
      type: "code",
      value: `console.log(await query("SELECT 1 + 1"))`,
    },
    {
      id: "initial3",
      type: "code",
      value: `for(let i = 0; i < 5; i++) {
  await sleep(1000);
  console.log("This is loop", i)
}`,
    },
  ]);

  const onAddCodeBlock = useCallback(() => {
    setValue((draft) => {
      draft.push({
        id: crypto.randomUUID(),
        type: "code",
        value: "",
      });
    });
  }, [setValue]);

  const onAddMarkdownBlock = useCallback(() => {
    setValue((draft) => {
      draft.push({
        id: crypto.randomUUID(),
        type: "markdown",
        value: "",
      });
    });
  }, [setValue]);

  return (
    <div className="w-full h-full flex-1 flex flex-col overflow-hidden">
      <div className="p-1 border-b">
        <Toolbar>
          <ToolbarButton text="Add Code" onClick={onAddCodeBlock} />
          <ToolbarButton text="Add Markdown" onClick={onAddMarkdownBlock} />
          <ToolbarSeparator />
          <ToolbarButton text="Restart" />
        </Toolbar>
      </div>
      <div className="flex-1 bg-gray-100 overflow-y-auto p-4">
        <div className="max-w-[1200px] bg-background mx-auto">
          {value.map((block, idx) => {
            if (block.type === "code") {
              return (
                <NotebookBlockCode
                  vm={vm}
                  key={block.id}
                  value={block}
                  onChange={(value) => {
                    setValue((draft) => {
                      draft[idx] = value;
                    });
                  }}
                />
              );
            } else {
              return (
                <NotebookBlockMarkdown
                  key={block.id}
                  value={block}
                  onChange={(value) => {
                    setValue((draft) => {
                      draft[idx] = value;
                    });
                  }}
                />
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
