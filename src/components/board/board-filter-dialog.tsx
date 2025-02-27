import { useCallback } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface BoardFilterProps {
  type: string;
  name: string;
  defaultValue: string;
  value: string;
  new?: boolean;
}

interface Props {
  onClose?: () => void;
  filter: BoardFilterProps;
  onFilter: (v: BoardFilterProps) => void;
  onAddFilter?: (v: BoardFilterProps) => void;
}

const DEFAULT_EMPTY = {
  type: "search",
  name: "",
  defaultValue: "",
  value: "",
};

export const DEFAULT_DATE_FILTER = [
  "Not timeframe override",
  "Custom date range",
  "Last 24 hours",
  "Today",
  "Yesterday",
  "This week",
  "This month",
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
];

export function BoardFilterDialog(props: Props) {
  let default_value = [...DEFAULT_DATE_FILTER];

  if (props.filter.type === "enum" && !!props.filter.value) {
    default_value = [...props.filter.value.split(",")];
  }

  let allowAddFilter = !!props.filter.name;

  if (props.filter.type === "enum") {
    allowAddFilter = !!props.filter.name && !!props.filter.value;
  }

  const onAddFilter = useCallback(() => {
    props.onAddFilter && props.onAddFilter(props.filter);
  }, [props]);

  return (
    <Dialog open onOpenChange={props.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Filter</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="mb-2">
            <div className="mb-1 text-sm font-medium">Select filter type</div>
            <Select
              value={props.filter.type}
              onValueChange={(v) =>
                props.onFilter({ ...DEFAULT_EMPTY, type: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="search">Search</SelectItem>
                <SelectItem value="enum">Multi-select ENUM</SelectItem>
                <SelectItem value="date">Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-2">
            <div className="mb-1 text-sm font-medium">Filter name*</div>
            <Input
              placeholder="Enter filter name"
              value={props.filter.name}
              onChange={(v) =>
                props.onFilter({ ...props.filter, name: v.target.value })
              }
            />
          </div>
          {props.filter.type === "enum" && (
            <div className="mb-2">
              <div className="mb-1 text-sm font-medium">
                Values*
                <div>
                  <small className="text-muted-foreground">
                    Enter values separated by comma
                  </small>
                </div>
              </div>
              <Input
                placeholder="value 1, value 2, value 3"
                value={props.filter.value}
                onChange={(v) =>
                  props.onFilter({ ...props.filter, value: v.target.value })
                }
              />
            </div>
          )}
          <div className="mb-2">
            <div className="mb-1 text-sm font-medium">
              Default value (optional)
              <p className="text-muted-foreground text-sm">
                If this field is left empty, no filter will be applied by
                default
              </p>
            </div>
            {props.filter.type === "search" ? (
              <Input
                placeholder="Enter default value"
                value={props.filter.defaultValue}
                onChange={(v) =>
                  props.onFilter({
                    ...props.filter,
                    defaultValue: v.target.value,
                  })
                }
              />
            ) : (
              <Select
                disabled={default_value.length === 0}
                value={props.filter.defaultValue}
                onValueChange={(v) =>
                  props.onFilter({ ...props.filter, defaultValue: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {default_value
                    .filter((x) => !!x)
                    .map((x) => {
                      return (
                        <SelectItem key={x} value={x}>
                          {x}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            )}
          </div>
          {props.filter.type !== "date" && !!props.filter.name && (
            <div>
              {`Use the variable {{ ${props.filter.name} }} in your charts SQL queries.`}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={!allowAddFilter}
            onClick={onAddFilter}
          >
            Save Filter
          </Button>
          <Button type="button" variant={"secondary"} onClick={props.onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
