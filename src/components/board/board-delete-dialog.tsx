import { IBoardStorageDriver } from "@/drivers/board-storage/base";
import { produce } from "immer";
import { LucideLoader } from "lucide-react";
import { useCallback, useState } from "react";
import { DashboardProps } from ".";
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
    chartName: string;
    storage: IBoardStorageDriver | undefined;
    value: DashboardProps | undefined;
  },
  DashboardProps | undefined
>(
  ({ close, chartName, chartId, storage, value }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");

    const deleteClicked = useCallback(async () => {
      if (name !== chartName) return;

      setLoading(true);

      if (storage) {
        if (value) {
          storage
            .remove(chartId)
            .then(() => {
              const newValue = produce(value, (draft) => {
                draft.layout = draft.layout.filter((f) => f.i !== chartId);
                draft.charts = draft.charts.filter((f) => f.id !== chartId);
              });
              close(newValue);
            })
            .finally(() => setLoading(false));
        }
      } else {
        setLoading(false);
      }
    }, [name, chartName, storage, value, chartId, close]);

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
  { defaultValue: undefined }
);
