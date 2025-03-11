import { useCommonDialog } from "@/components/common-dialog";
import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
} from "@/components/gui/toolbar";
import { DoltIcon } from "@/components/icons/outerbase-icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useStudioContext } from "@/context/driver-provider";
import { useSchema } from "@/context/schema-provider";
import { cn } from "@/lib/utils";
import { GitBranch, Minus, Plus, Table } from "@phosphor-icons/react";
import { ChevronDown, Loader, MoreHorizontal, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import useDoltCreateBranchModal from "./dolt-create-branch";

interface DoltStatusResultItem {
  table_name: string;
  staged: number;
  status: string;
}

interface DoltCommitResultItem {
  commit_hash: string;
  committer: string;
  message: string;
  date: string;
}

function DoltCommitLog({
  commitList,
  refreshStatus,
}: {
  commitList: DoltCommitResultItem[];
  refreshStatus: () => void;
}) {
  const { modal: createBranchModal, openModal: openCreateBranch } =
    useDoltCreateBranchModal(refreshStatus);

  const { databaseDriver } = useStudioContext();
  const { showDialog: showCommonDialog } = useCommonDialog();

  const onResetClicked = useCallback(
    (commit: DoltCommitResultItem) => {
      showCommonDialog({
        title: "Soft Reset",
        content: (
          <div className="flex flex-col gap-2">
            <p>Are you sure you want to reset to this commit?</p>
            <div className="flex flex-col gap-1 rounded border p-4 text-sm shadow-sm">
              <div className="font-semibold">{commit.message}</div>
              <div className="font-mono">{commit.commit_hash}</div>
            </div>
          </div>
        ),
        destructive: true,
        actions: [
          {
            text: "Reset",
            onClick: async () => {
              await databaseDriver.query(
                `CALL DOLT_RESET(${databaseDriver.escapeValue(commit.commit_hash)});`
              );
            },
            onComplete: () => {
              refreshStatus();
            },
          },
        ],
      });
    },
    [refreshStatus, showCommonDialog, databaseDriver]
  );

  return (
    <div className="w-full overflow-x-hidden overflow-y-auto">
      {createBranchModal}

      <div className="flex w-full flex-col py-4 pl-4">
        {commitList.map((commit) => (
          <div
            key={commit.commit_hash}
            className="fgap-1 relative ml-2 flex border-l-2 border-blue-500 p-2 pl-4"
          >
            <div className="bg-background absolute top-[10px] -left-[9px] h-4 w-4 rounded-full border-4 border-blue-500"></div>

            <div className="flex-1 overflow-hidden">
              <span className="line-clamp-1 flex-1 text-sm font-semibold">
                {commit.message}
              </span>

              <span className="line-clamp-1 flex-1 font-mono text-sm">
                {commit.commit_hash}
              </span>

              <div className="mt-1 flex gap-2 overflow-hidden text-sm">
                <div className="text-muted-foreground line-clamp-1">
                  {commit.date}
                </div>
                <div className="line-clamp-1 text-blue-700 dark:text-blue-400">
                  {commit.committer}
                </div>
              </div>
            </div>

            <div className="ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end">
                  <DropdownMenuItem
                    inset
                    onClick={() => {
                      navigator.clipboard.writeText(commit.commit_hash);
                      toast("Copied commit hash");
                    }}
                  >
                    Copy Commit Hash
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openCreateBranch(commit.commit_hash)}
                  >
                    <GitBranch className="mr-2 h-4 w-4" />
                    Create Branch
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    inset
                    className="text-red-500 focus:bg-red-500 focus:text-white"
                    onClick={() => {
                      onResetClicked(commit);
                    }}
                  >
                    Reset (Soft)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DoltChangeItem({
  status,
  refreshStatus,
}: {
  status: DoltStatusResultItem;
  refreshStatus: () => void;
}) {
  const { databaseDriver } = useStudioContext();
  const [loading, setLoading] = useState(false);

  const onStageClicked = useCallback(
    (tableName: string) => {
      setLoading(true);
      databaseDriver
        .query(`CALL DOLT_ADD(${databaseDriver.escapeValue(tableName)});`)
        .then(refreshStatus)
        .finally(() => setLoading(false));
    },
    [databaseDriver, refreshStatus]
  );

  const onResetClicked = useCallback(
    (tableName: string) => {
      setLoading(true);
      databaseDriver
        .query(`CALL DOLT_RESET(${databaseDriver.escapeValue(tableName)});`)
        .then(refreshStatus)
        .finally(() => setLoading(false));
    },
    [databaseDriver, refreshStatus]
  );

  let itemClassName = "";
  let action = <></>;
  let actionShortDescription = "";

  if (status.status === "new table") {
    itemClassName = "text-green-500";
    actionShortDescription = status.staged > 0 ? "A" : "U";
  } else if (status.status === "deleted") {
    actionShortDescription = "D";
    itemClassName = "text-red-500";
  } else if (status.status === "modified") {
    actionShortDescription = "M";
    itemClassName = "text-yellow-500";
  }

  if (loading) {
    action = <Loader className="h-4 w-4 animate-spin cursor-pointer" />;
  } else if (status.staged > 0) {
    action = (
      <Minus
        className="h-4 w-4 cursor-pointer"
        onClick={() => onResetClicked(status.table_name)}
      />
    );
  } else {
    action = (
      <Plus
        className="h-4 w-4 cursor-pointer"
        onClick={() => onStageClicked(status.table_name)}
      />
    );
  }

  return (
    <div key={status.table_name} className="flex items-center gap-2 font-mono">
      <Table />
      <span
        className={cn(
          "flex-1 text-sm",
          status.status === "deleted" ? "line-through" : ""
        )}
      >
        {status.table_name}
      </span>
      {action}
      <span className={cn(itemClassName, "text-md font-bold")}>
        {actionShortDescription}
      </span>
    </div>
  );
}

function DoltChanges({
  statusList,
  refreshStatus,
}: {
  statusList: DoltStatusResultItem[];
  refreshStatus: () => void;
}) {
  const { databaseDriver } = useStudioContext();
  const [loading, setLoading] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const onCommitClicked = useCallback(async () => {
    try {
      setLoading(true);

      await databaseDriver.query(
        `CALL DOLT_COMMIT("-m", ${databaseDriver.escapeValue(commitMessage)});`
      );

      setCommitMessage("");

      refreshStatus();
    } catch (e) {
      if (e instanceof Error) {
        toast(e.message);
      } else {
        toast("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [refreshStatus, databaseDriver, commitMessage]);

  const stagedItems = statusList.filter((status) => status.staged);
  const changedItems = statusList.filter((status) => !status.staged);

  return (
    <div>
      <div className="flex flex-col gap-2 p-4">
        <Input
          placeholder="Commit message"
          value={commitMessage}
          onChange={(e) => {
            setCommitMessage(e.target.value);
          }}
        />

        <Button
          disabled={stagedItems.length === 0 || !commitMessage || loading}
          size={"sm"}
          onClick={onCommitClicked}
        >
          {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          Commit
        </Button>
      </div>

      {stagedItems.length > 0 && (
        <>
          <div className="mb-1 p-4 py-0 text-sm font-semibold">STAGES</div>
          <div className="flex flex-col px-4 pb-2">
            {stagedItems.map((status) => {
              return (
                <DoltChangeItem
                  key={status.table_name}
                  status={status}
                  refreshStatus={refreshStatus}
                />
              );
            })}
          </div>
        </>
      )}

      {changedItems.length > 0 && (
        <>
          <div className="mb-1 p-4 py-0 text-sm font-semibold">CHANGES</div>
          <div className="flex flex-col px-4">
            {changedItems.map((status) => {
              return (
                <DoltChangeItem
                  key={status.table_name}
                  status={status}
                  refreshStatus={refreshStatus}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function DoltSidebar() {
  const { currentSchemaName } = useSchema();
  const { databaseDriver } = useStudioContext();
  const [branchList, setBranchList] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [commitList, setCommitList] = useState<DoltCommitResultItem[]>([]);
  const [statusList, setStatusList] = useState<DoltStatusResultItem[]>([]);

  const refreshDoltSchema = useCallback(async () => {
    if (currentSchemaName) {
      const branchResult = (
        await databaseDriver.query(
          `SELECT name, (name = active_branch()) AS active FROM dolt_branches;`
        )
      ).rows as { name: string; active: number }[];

      setBranchList(branchResult.map((row) => row.name));

      setSelectedBranch(
        branchResult.find((row) => !!row.active)?.name ?? "main"
      );

      setCommitList(
        (await databaseDriver.query(`SELECT * FROM dolt_log LIMIT 30;`))
          .rows as unknown as DoltCommitResultItem[]
      );

      setStatusList(
        (await databaseDriver.query(`SELECT * FROM dolt_status;`))
          .rows as unknown as DoltStatusResultItem[]
      );
    } else {
      setBranchList([]);
    }
  }, [databaseDriver, setBranchList, currentSchemaName]);

  const { modal: createBranchModal, openModal: openCreateBranchModal } =
    useDoltCreateBranchModal(refreshDoltSchema);

  const onCheckoutBranch = useCallback(
    (branchName: string) => {
      databaseDriver
        .query(`CALL DOLT_CHECKOUT(${databaseDriver.escapeValue(branchName)});`)
        .then(refreshDoltSchema);
    },
    [databaseDriver, refreshDoltSchema]
  );

  useEffect(() => {
    refreshDoltSchema().then().catch();
  }, [refreshDoltSchema, currentSchemaName]);

  if (!currentSchemaName) {
    return (
      <div className="text-muted-foreground flex w-full flex-col items-center justify-center gap-4 p-4 text-sm">
        <DoltIcon className="text-green-500" />

        <p className="text-center">
          No schema or database is currently selected.
        </p>
        <p className="text-center">
          Double-click on a database to set it as the active one.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col overflow-hidden">
      {createBranchModal}
      <div className="border-b p-1">
        <Toolbar>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant={"outline"}>
                <GitBranch className="mr-2 h-4 w-4" />
                {selectedBranch}
                <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start">
              <DropdownMenuItem
                onClick={() => {
                  openCreateBranchModal();
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Branch
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {branchList.map((branch) => (
                <DropdownMenuItem
                  key={branch}
                  onClick={() => onCheckoutBranch(branch)}
                >
                  <GitBranch className="mr-2 h-4 w-4" />
                  {branch}
                  {branch === selectedBranch && (
                    <span className="ml-2 font-mono text-sm text-yellow-500">
                      Current
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ToolbarSeparator />
          <ToolbarButton
            onClick={refreshDoltSchema}
            text="Refresh"
            icon={<RefreshCcw className="h-4 w-4" />}
          />
        </Toolbar>
      </div>

      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel>
          <DoltChanges
            statusList={statusList}
            refreshStatus={refreshDoltSchema}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel className="flex">
          <DoltCommitLog
            commitList={commitList}
            refreshStatus={refreshDoltSchema}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
