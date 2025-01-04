import { useDatabaseDriver } from "@/context/driver-provider";
import { useSchema } from "@/context/schema-provider";
import { useCallback, useEffect, useState } from "react";
import { Toolbar, ToolbarButton } from "../../toolbar";
import { RefreshCcw } from "lucide-react";
import { GitBranch, Minus, Plus, Table } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DoltStatusResultItem {
  table_name: string;
  staged: number;
  status: string;
}

interface DoltCommitResultItem {
  commit_hash: string;
  committer: string;
  message: string;
}

function DoltCommitLog({ commitList }: { commitList: DoltCommitResultItem[] }) {
  return (
    <div className="flex-1 border-t mt-4">
      <div className="p-4 text-sm">Commits</div>
      <div className="px-4 flex flex-col">
        {commitList.map((commit) => (
          <div
            key={commit.commit_hash}
            className="relative flex flex-col gap-1 border-l-2 border-blue-500 p-2 pl-4 ml-2"
          >
            <div className="w-4 h-4 bg-background border-4 border-blue-500 rounded-full absolute -left-[10px] top-[10px]"></div>

            <span className="flex-1 text-sm line-clamp-1">
              {commit.message}
            </span>
            <span className="flex-1 text-xs font-mono line-clamp-1">
              {commit.commit_hash}
            </span>
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
  const { databaseDriver } = useDatabaseDriver();

  const onStageClicked = useCallback(
    (tableName: string) => {
      databaseDriver
        .query(`CALL DOLT_ADD(${databaseDriver.escapeValue(tableName)});`)
        .then(refreshStatus);
    },
    [databaseDriver, refreshStatus]
  );

  const onResetClicked = useCallback(
    (tableName: string) => {
      databaseDriver
        .query(`CALL DOLT_RESET(${databaseDriver.escapeValue(tableName)});`)
        .then(refreshStatus);
    },
    [databaseDriver, refreshStatus]
  );

  let itemClassName = "";

  if (status.status === "new table") {
    itemClassName = "text-green-500";
  } else if (status.status === "deleted") {
    itemClassName = "text-red-500";
  } else if (status.status === "modified") {
    itemClassName = "text-yellow-500";
  }

  return (
    <div key={status.table_name} className="flex items-center gap-2 font-mono">
      <Table />
      <span className={cn(itemClassName, "flex-1 text-sm")}>
        {status.table_name}
      </span>
      {status.staged > 0 ? (
        <Minus
          onClick={() => {
            onResetClicked(status.table_name);
          }}
        />
      ) : (
        <Plus onClick={() => onStageClicked(status.table_name)} />
      )}
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
  const { databaseDriver } = useDatabaseDriver();
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
    } finally {
      setLoading(false);
    }
  }, [refreshStatus, databaseDriver, commitMessage]);

  const stagedItems = statusList.filter((status) => status.staged);
  const changedItems = statusList.filter((status) => !status.staged);

  return (
    <div>
      <div className="p-4 flex flex-col gap-2">
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
          Commit
        </Button>
      </div>

      {stagedItems.length > 0 && (
        <>
          <div className="p-4 text-sm">Staged</div>
          <div className="px-4 flex flex-col gap-2">
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
          <div className="p-4 text-sm">Changes</div>
          <div className="px-4 flex flex-col gap-2">
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
  const { databaseDriver } = useDatabaseDriver();
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
        (await databaseDriver.query(`SELECT * FROM dolt_log;`))
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

  return (
    <div className="flex-1 overflow-hidden overflow-y-auto">
      <div className="p-1 border-b">
        <Toolbar>
          <ToolbarButton
            onClick={refreshDoltSchema}
            text="Refresh"
            icon={<RefreshCcw className="w-4 h-4" />}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant={"ghost"}>
                <GitBranch className="w-4 h-4 mr-2" />
                Checkout
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start">
              <DropdownMenuItem>
                <Plus className="w-4 h-4 mr-2" />
                New Branch
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {branchList.map((branch) => (
                <DropdownMenuItem
                  key={branch}
                  onClick={() => onCheckoutBranch(branch)}
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  {branch}
                  {branch === selectedBranch && (
                    <span className="text-yellow-500 font-mono ml-2 text-sm">
                      Current
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Toolbar>
      </div>

      <DoltChanges statusList={statusList} refreshStatus={refreshDoltSchema} />
      <DoltCommitLog commitList={commitList} />
    </div>
  );
}
