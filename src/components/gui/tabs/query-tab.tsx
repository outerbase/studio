import { useCallback, useMemo, useRef, useState } from "react";
import { identify } from "sql-query-identifier";
import {
  LucideGrid,
  LucideLoader,
  LucideMessageSquareWarning,
  LucidePlay,
  LucideSave,
} from "lucide-react";
import SqlEditor from "@/components/gui/sql-editor";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { KEY_BINDING } from "@/lib/key-matcher";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { selectStatementFromPosition } from "@/drivers/sqlite/sql-helper";
import QueryProgressLog from "../query-progress-log";
import { useAutoComplete } from "@/context/auto-complete-provider";
import { useDatabaseDriver } from "@/context/driver-provider";
import {
  MultipleQueryProgress,
  MultipleQueryResult,
  multipleQuery,
} from "@/components/lib/multiple-query";
import WindowTabs, { useTabsContext } from "../windows-tab";
import QueryResult from "../query-result";
import { useSchema } from "@/context/schema-provider";

interface QueryWindowProps {
  initialCode?: string;
  initialName: string;
  initialSavedKey?: string;
  initialNamespace?: string;
}

export default function QueryWindow({
  initialCode,
  initialName,
  initialSavedKey,
  initialNamespace,
}: QueryWindowProps) {
  const { schema } = useAutoComplete();
  const { databaseDriver, docDriver } = useDatabaseDriver();
  const { refresh: refreshSchema } = useSchema();
  const [code, setCode] = useState(initialCode ?? "");
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const [lineNumber, setLineNumber] = useState(0);
  const [columnNumber, setColumnNumber] = useState(0);

  const [queryTabIndex, setQueryTabIndex] = useState(0);
  const [progress, setProgress] = useState<MultipleQueryProgress>();
  const [data, setData] = useState<MultipleQueryResult[]>();
  const [name, setName] = useState(initialName);
  const { renameCurrentTab } = useTabsContext();

  const [namespaceName, setNamespaceName] = useState(
    initialNamespace ?? "Unsaved Query"
  );
  const [savedKey, setSavedKey] = useState<string | undefined>(initialSavedKey);
  const [saveLoading, setSaveLoading] = useState(false);

  const onRunClicked = (all = false) => {
    const statements = identify(code, {
      dialect: "sqlite",
      strict: false,
    });

    let finalStatements: string[] = [];

    const editor = editorRef.current;

    if (all) {
      finalStatements = statements.map((s) => s.text);
    } else if (editor?.view) {
      const position = editor.view.state.selection.main.head;
      const statement = selectStatementFromPosition(statements, position);

      if (statement) {
        finalStatements = [statement.text];
      }
    }

    if (finalStatements.length > 0) {
      // Reset the result and make a new query
      setData(undefined);
      setProgress(undefined);
      setQueryTabIndex(0);

      multipleQuery(databaseDriver, finalStatements, (currentProgrss) => {
        setProgress(currentProgrss);
      })
        .then(({ result: completeQueryResult, logs: completeLogs }) => {
          setData(completeQueryResult);

          // Check if sql contain any CREATE/DROP
          let hasAlterSchema = false;
          for (const log of completeLogs) {
            if (
              log.sql.trim().substring(0, "create ".length).toLowerCase() ===
              "create "
            ) {
              hasAlterSchema = true;
              break;
            } else if (
              log.sql.trim().substring(0, "drop ".length).toLowerCase() ===
              "drop "
            ) {
              hasAlterSchema = true;
              break;
            }
          }

          if (hasAlterSchema) {
            refreshSchema();
          }
        })
        .catch(console.error);
    }
  };

  const onSaveQuery = useCallback(() => {
    if (docDriver) {
      setSaveLoading(true);
      if (savedKey) {
        docDriver
          .updateDoc(savedKey, {
            content: code,
            name: name || "Unnamed Query",
          })
          .finally(() => {
            setSaveLoading(false);
          });
      } else {
        docDriver
          .createDoc("sql", docDriver.getCurrentNamespace(), {
            content: code,
            name: name || "Unnamed Query",
          })
          .then((d) => {
            setSavedKey(d.id);
            setNamespaceName(d.namespace.name);
          })
          .finally(() => {
            setSaveLoading(false);
          });
      }
    }
  }, [docDriver, code, name, savedKey]);

  const windowTab = useMemo(() => {
    return (
      <WindowTabs
        key="main-window-tab"
        onSelectChange={setQueryTabIndex}
        onTabsChange={() => {}}
        hideCloseButton
        selected={queryTabIndex}
        tabs={[
          ...(data ?? []).map((queryResult, queryIdx) => ({
            component: (
              <QueryResult result={queryResult} key={queryResult.order} />
            ),
            key: "query_" + queryResult.order,
            title: "Query " + (queryIdx + 1),
            icon: LucideGrid,
          })),
          ...(progress
            ? [
                {
                  key: "summary",
                  title: "Summary",
                  icon: LucideMessageSquareWarning,
                  component: (
                    <div className="w-full h-full overflow-y-auto overflow-x-hidden">
                      <QueryProgressLog progress={progress} />
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />
    );
  }, [progress, queryTabIndex, data]);

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel style={{ position: "relative" }}>
        <div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col">
          <div className="border-b pl-2 pr-1 py-1 flex">
            <div className="text-xs shrink-0 items-center flex text-secondary-foreground p-1">
              {namespaceName} /
            </div>
            <div className="inline-block relative">
              <span className="inline-block text-xs p-1 outline-none font-semibold min-w-[175px] border border-background opacity-0">
                &nbsp;{name}
              </span>
              <input
                onBlur={(e) => {
                  renameCurrentTab(e.currentTarget.value || "Unnamed Query");
                }}
                placeholder="Please name your query"
                spellCheck="false"
                className="absolute top-0 right-0 left-0 bottom-0 text-xs p-1 outline-none font-semibold border border-background focus:border-secondary-foreground rounded"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
              />
            </div>
          </div>
          <div className="grow overflow-hidden">
            <SqlEditor
              ref={editorRef}
              value={code}
              onChange={setCode}
              schema={schema}
              onCursorChange={(_, line, col) => {
                setLineNumber(line);
                setColumnNumber(col);
              }}
              onKeyDown={(e) => {
                if (KEY_BINDING.run.match(e)) {
                  onRunClicked();
                  e.preventDefault();
                }
              }}
            />
          </div>
          <div className="grow-0 shrink-0">
            <Separator />
            <div className="flex gap-1 p-1">
              <Button
                variant={"ghost"}
                size="sm"
                onClick={() => onRunClicked()}
              >
                <LucidePlay className="w-4 h-4 mr-2" />
                Run Current{" "}
                <span className="text-xs ml-2 px-2 bg-secondary py-1 rounded">
                  {KEY_BINDING.run.toString()}
                </span>
              </Button>

              <Button
                variant={"ghost"}
                size="sm"
                onClick={() => onRunClicked(true)}
              >
                <LucidePlay className="w-4 h-4 mr-2" />
                Run All
              </Button>

              <div className="grow items-center flex text-xs mr-2 gap-2 border-l pl-4">
                <div>Ln {lineNumber}</div>
                <div>Col {columnNumber + 1}</div>
              </div>

              <Button
                size="sm"
                onClick={onSaveQuery}
                className="mr-2"
                disabled={saveLoading}
              >
                {saveLoading ? (
                  <LucideLoader className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <LucideSave className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} style={{ position: "relative" }}>
        {windowTab}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
