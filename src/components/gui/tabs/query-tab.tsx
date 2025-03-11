import { PromptSelectedFragment } from "@/components/editor/prompt-plugin";
import SqlEditor from "@/components/gui/sql-editor";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TAB_PREFIX_SAVED_QUERY } from "@/const";
import { useStudioContext } from "@/context/driver-provider";
import { useSchema } from "@/context/schema-provider";
import {
  SavedDocData,
  SavedDocInput,
} from "@/drivers/saved-doc/saved-doc-driver";
import { escapeSqlValue, extractInputValue } from "@/drivers/sqlite/sql-helper";
import { KEY_BINDING } from "@/lib/key-matcher";
import {
  multipleQuery,
  MultipleQueryProgress,
  MultipleQueryResult,
} from "@/lib/sql/multiple-query";
import { sendAnalyticEvents } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import { tokenizeSql } from "@outerbase/sdk-transform";
import { CaretDown } from "@phosphor-icons/react";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import {
  LucideGrid,
  LucideMessageSquareWarning,
  LucidePlay,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { format } from "sql-formatter";
import { isExplainQueryPlan } from "../query-explanation";
import QueryProgressLog from "../query-progress-log";
import SaveDocButton from "../save-doc-button";
import {
  resolveToNearestStatement,
  splitSqlQuery,
} from "../sql-editor/statement-highlight";
import ExplainResultTab from "../tabs-result/explain-result-tab";
import QueryResult from "../tabs-result/query-result-tab";
import WindowTabs, { useTabsContext, WindowTabItemProps } from "../windows-tab";
import { QueryPlaceholder } from "./query-placeholder";

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
  const { databaseDriver, docDriver, agentDriver } = useStudioContext();
  const { refresh: refreshSchema, autoCompleteSchema } = useSchema();
  const [code, setCode] = useState(initialCode ?? "");
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const [fontSize, setFontSize] = useState(0.875);
  const [lineNumber, setLineNumber] = useState(0);
  const [columnNumber, setColumnNumber] = useState(0);

  const [queryTabIndex, setQueryTabIndex] = useState(0);
  const [progress, setProgress] = useState<MultipleQueryProgress>();
  const [data, setData] = useState<MultipleQueryResult[]>();
  const [name, setName] = useState(initialName);
  const { changeCurrentTab } = useTabsContext();

  const [namespaceName, setNamespaceName] = useState(
    initialNamespace ?? "Unsaved Query"
  );
  const [savedKey, setSavedKey] = useState<string | undefined>(initialSavedKey);
  const [placeholders, setPlaceholders] = useState<Record<string, string>>({});
  const { schema } = useSchema();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPlaceholders((prev) => {
        const newPlaceholders: Record<string, string> = {};
        const token = tokenizeSql(code, databaseDriver.getFlags().dialect);

        const foundPlaceholders = token
          .filter((t) => t.type === "PLACEHOLDER")
          .map((t) => t.value.slice(1));

        for (const foundPlaceholder of foundPlaceholders) {
          newPlaceholders[foundPlaceholder] = prev[foundPlaceholder] ?? "";
        }

        return newPlaceholders;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [code, databaseDriver]);

  const onFormatClicked = () => {
    try {
      setCode(
        format(code, {
          language: "sqlite",
          tabWidth: 2,
        })
      );
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onRunClicked = (all = false, explained = false) => {
    let finalStatements: string[] = [];

    const editorState = editorRef.current?.view?.state;

    if (!editorState) return;

    if (all) {
      finalStatements = splitSqlQuery(editorState).map((q) => q.text);
    } else {
      const segment = resolveToNearestStatement(editorState);
      if (!segment) return;

      let statement = editorState.doc.sliceString(segment.from, segment.to);

      if (
        explained &&
        statement.toLowerCase().indexOf("explain query plan") !== 0
      ) {
        if (databaseDriver.getFlags().dialect === "sqlite") {
          statement = "explain query plan " + statement;
        } else if (databaseDriver.getFlags().dialect === "mysql") {
          statement = "explain format=json " + statement;
        } else if (databaseDriver.getFlags().dialect === "postgres") {
          statement = "explain (format json) " + statement;
        }
      }

      if (statement) {
        finalStatements = [statement];
      }
    }

    if (finalStatements.length > 0) {
      // Reset the result and make a new query
      setData(undefined);
      setProgress(undefined);
      setQueryTabIndex(0);

      for (let i = 0; i < finalStatements.length; i++) {
        const token = tokenizeSql(
          finalStatements[i],
          databaseDriver.getFlags().dialect
        );

        // Defensive measurement
        if (token.join("") === finalStatements[i]) {
          sendAnalyticEvents([
            { name: "tokenize_mismatch", data: { token, finalStatements } },
          ]);

          toast.error("Failed to tokenize SQL statement");

          return;
        }

        const variables = token
          .filter((t) => t.type === "PLACEHOLDER")
          .map((t) => t.value.slice(1));

        if (
          variables.length > 0 &&
          variables.some((p) => placeholders[p] === "")
        ) {
          toast.error("Please fill in all placeholders");
          return;
        }

        finalStatements[i] = token
          .map((t) => {
            if (t.type === "PLACEHOLDER") {
              return escapeSqlValue(
                extractInputValue(placeholders[t.value.slice(1)])
              );
            }
            return t.value;
          })
          .join("");
      }

      multipleQuery(databaseDriver, finalStatements, (currentProgress) => {
        setProgress(currentProgress);
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
            } else if (
              databaseDriver.getFlags().supportUseStatement &&
              log.sql.trim().substring(0, "use ".length).toLowerCase() ===
                "use "
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

  const onSaveComplete = useCallback(
    (doc: SavedDocData) => {
      setNamespaceName(doc.namespace.name);
      setSavedKey(doc.id);
      changeCurrentTab({ identifier: TAB_PREFIX_SAVED_QUERY + doc.id });
    },
    [changeCurrentTab]
  );

  const onPrepareSaveContent = useCallback((): SavedDocInput => {
    return { content: code, name };
  }, [code, name]);

  const windowTab = useMemo(() => {
    const queryTabs: WindowTabItemProps[] = [];

    for (const queryResult of data ?? []) {
      if (
        isExplainQueryPlan(queryResult.sql, databaseDriver.getFlags().dialect)
      ) {
        queryTabs.push({
          component: <ExplainResultTab data={queryResult.result} />,
          key: "explain_" + queryResult.order,
          identifier: "explain_" + queryResult.order,
          title: "Explain (Visual)",
          icon: LucideMessageSquareWarning,
        });
      }

      queryTabs.push({
        component: <QueryResult result={queryResult} key={queryResult.order} />,
        key: "query_" + queryResult.order,
        identifier: "query_" + queryResult.order,
        title:
          `${getSingleTableName(queryResult.sql) ?? "Query " + (queryResult.order + 1)}` +
          ` (${queryResult.result.rows.length}x${queryResult.result.headers.length})`,
        icon: LucideGrid,
      });
    }

    if (progress) {
      queryTabs.push({
        key: "summary",
        identifier: "summary",
        title: "Summary",
        icon: LucideMessageSquareWarning,
        component: (
          <div className="h-full w-full overflow-x-hidden overflow-y-auto">
            <QueryProgressLog progress={progress} />
          </div>
        ),
      });
    }

    return (
      <WindowTabs
        key="main-window-tab"
        onSelectChange={setQueryTabIndex}
        onTabsChange={() => {}}
        hideCloseButton
        selected={queryTabIndex}
        tabs={queryTabs}
      />
    );
  }, [progress, queryTabIndex, data, databaseDriver]);

  const onCursorChange = useCallback(
    (_: unknown, line: number, col: number) => {
      setLineNumber(line);
      setColumnNumber(col);
    },
    []
  );

  const onPrompt = useCallback(
    async (promptQuery: string, option: PromptSelectedFragment) => {
      if (!agentDriver) return "";

      const agentResponse = await agentDriver.run(
        option.selectedModel ?? "gemma-7b-it",
        promptQuery,
        option.sessionId,
        {
          selected: option?.text ?? "",
          schema: schema,
        }
      );

      return agentResponse;
    },
    [agentDriver, schema]
  );

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel style={{ position: "relative" }}>
        <div className="absolute top-0 right-0 bottom-0 left-0 flex flex-col">
          <div className="flex border-b bg-neutral-50 py-3 pr-1 pl-3 dark:bg-neutral-950">
            <div className="text-secondary-foreground flex shrink-0 items-center p-1 text-sm">
              {namespaceName} /
            </div>
            <div className="relative inline-block">
              <span className="border-background inline-block min-w-[175px] border p-1 text-sm font-semibold opacity-0 outline-hidden">
                &nbsp;{name}
              </span>
              <input
                onBlur={(e) => {
                  changeCurrentTab({
                    title: e.currentTarget.value || "Unnamed Query",
                  });
                }}
                placeholder="Please name your query"
                spellCheck="false"
                className="focus:border-secondary-foreground absolute top-0 right-0 bottom-0 left-0 rounded bg-transparent p-1 text-sm font-semibold outline-hidden"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
              />
            </div>

            <div className="flex-1" />

            <div className="flex gap-2">
              {docDriver && (
                <SaveDocButton
                  onComplete={onSaveComplete}
                  onPrepareContent={onPrepareSaveContent}
                  docId={savedKey}
                />
              )}

              <div className="flex">
                <button
                  onClick={() => onRunClicked()}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "rounded-r-none"
                  )}
                >
                  <LucidePlay className="mr-2 h-4 w-4" />
                  Run
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "rounded-l-none border-l"
                      )}
                    >
                      <CaretDown size={12} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onRunClicked()}>
                      Run Current Statement
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onRunClicked(true)}>
                      Run All Statements
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onRunClicked(false, true)}>
                      Explain Current Statement
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <div className="grow overflow-hidden p-2">
            <SqlEditor
              onPrompt={onPrompt}
              agents={agentDriver}
              ref={editorRef}
              dialect={databaseDriver.getFlags().dialect}
              value={code}
              onChange={setCode}
              schema={autoCompleteSchema}
              fontSize={fontSize}
              onFontSizeChanged={setFontSize}
              onCursorChange={onCursorChange}
              onKeyDown={(e) => {
                if (KEY_BINDING.run.match(e)) {
                  onRunClicked();
                  e.preventDefault();
                } else if (KEY_BINDING.format.match(e)) {
                  onFormatClicked();
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            />
          </div>
          <div className="shrink-0 grow-0">
            <div className="flex gap-1 px-2 pb-1">
              <div className="mr-2 flex grow items-center gap-2 pl-4 text-xs">
                <div>Ln {lineNumber}</div>
                <div>Col {columnNumber + 1}</div>
              </div>
              <div>
                {Object.keys(placeholders).length > 0 && (
                  <QueryPlaceholder
                    placeholders={placeholders}
                    onChange={setPlaceholders}
                  />
                )}
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"ghost"}
                    size="sm"
                    onClick={onFormatClicked}
                    className="text-neutral-800 dark:text-neutral-200"
                  >
                    Format
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="p-4">
                  <p className="mb-2">
                    <span className="bg-secondary text-secondary-foreground inline-block rounded px-2 py-1">
                      {KEY_BINDING.format.toString()}
                    </span>
                  </p>
                  <p>Format SQL queries for readability</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle orientation="horizontal" withHandle />
      <ResizablePanel defaultSize={50} style={{ position: "relative" }}>
        {windowTab}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export function getSingleTableName(query: string): string | null {
  try {
    // Normalize query by removing extra spaces and converting to lowercase
    const normalizedQuery = query.replace(/\s+/g, " ").trim().toLowerCase();

    // Match the table names after "from" keyword
    const fromMatch = normalizedQuery.match(
      /from\s+([^\s,;]+(?:\s*,\s*[^\s,;]+)*)/i
    );
    const joinMatches = normalizedQuery.match(/join\s+([^\s,;]+)/gi);

    // If there are JOINs, more than one table is referenced
    if (joinMatches && joinMatches.length > 0) {
      return null;
    }

    // Check if a single table is present
    if (fromMatch) {
      const tableName = fromMatch[1];

      // Ensure no additional tables are mentioned
      const additionalTablesMatch = tableName.match(/,\s*[^\s,;]+/);
      if (additionalTablesMatch) {
        return null;
      }

      return tableName;
    }

    // No table found
    return null;
  } catch (e) {
    return null;
  }
}
