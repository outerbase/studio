import { OuterbaseAPIDashboardDetail } from "@/outerbase-cloud/api-type";
import OuterbaseBoardSourceDriver from "@/outerbase-cloud/database-source";
import { LucideLoader } from "lucide-react";
import { useCallback, useState } from "react";
import CopyableText from "../copyable-text";
import { createDialog } from "../create-dialog";
import LabelInput from "../label-input";
import { Button } from "../ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export const deleteChartDialog = createDialog<
  {
    chartId: string;
    boardId: string;
    chartName: string;
    value: OuterbaseAPIDashboardDetail;
    source: OuterbaseBoardSourceDriver | undefined;
  },
  string | undefined
>(
  ({ close, chartName, chartId, source, boardId, value }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");

    const deleteClicked = useCallback(async () => {
      if (name !== chartName) return;

      setLoading(true);

      if (source) {
        source
          .onLayoutRemove(chartId, boardId, value)
          .then(() => close(chartId))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }, [name, chartName, source, chartId, boardId, value, close]);

    return (
      <>
        <DialogHeader>
          <DialogTitle>Confirm deletion of {chartName}</DialogTitle>
          <DialogDescription>
            All saved queries, dashboards, definitions and any other
            contributions made to your Base will be deleted. This action is
            permanent and <strong>cannot</strong>
            be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <CopyableText text={chartName} />
          </div>

          <LabelInput
            label="Enter the name of this Base to confirm:"
            placeholder="Board name"
            value={name}
            required
            onChange={(e) => setName(e.currentTarget.value)}
          />
        </div>

        <DialogFooter>
          <Button
            disabled={loading || chartName !== name}
            onClick={deleteClicked}
            variant={"destructive"}
          >
            {loading && <LucideLoader className="mr-2 h-4 w-4 animate-spin" />}I
            understand, delete this base
          </Button>
          <Button variant={"secondary"} onClick={() => close(undefined)}>
            Cancel
          </Button>
        </DialogFooter>
      </>
    );
  },
  { defaultValue: "close" }
);
