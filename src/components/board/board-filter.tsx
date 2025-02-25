"use client";
import { produce } from "immer";
import {
  CalendarDays,
  Ellipsis,
  ListFilter,
  ListOrdered,
  Search,
} from "lucide-react";
import { useCallback, useState } from "react";
import { DashboardProps } from ".";
import { buttonVariants } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { BoardFilterDialog } from "./board-filter-dialog";
import { BoardFilterDate } from "./board-filter/board-filter-date";
import { BoardFilterEnum } from "./board-filter/board-filter-enum";
import { BoardFilterInput } from "./board-filter/board-filter-input";
import { useBoardContext } from "./board-provider";
import { BoardToolbar } from "./board-tool/board-toolbar";

interface Props {
  interval: number;
  onChangeInterval: (v: number) => void;
  onRefresh?: () => void;
  onCancel: () => void;
  value: DashboardProps;
  onChange: (v: DashboardProps) => void;
}

export function BoardFilter(props: Props) {
  const { storage, filterValue, onFilterValueChange, setBoardMode } =
    useBoardContext();
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(true);
  const [selectIndex, setSelectIndex] = useState<number | undefined>(undefined);

  const onFilter = useCallback(() => {
    const data = produce(props.value, (draft) => {
      draft.data.filters.push({
        type: "search",
        defaultValue: "",
        value: "",
        name: "",
        new: true,
      });
    });
    props.onChange(data);
    setSelectIndex(data.data.filters.length - 1);
    setOpen(true);
  }, [props]);

  const onSave = useCallback(() => {
    if (storage) {
      setBoardMode(null);
      storage.save(props.value);
    }
  }, [props, storage, setBoardMode]);

  const mapFilterItem = props.value.data.filters.map((x, i) => {
    const icon =
      x.type === "search" ? (
        <Search className="h-3 w-3" />
      ) : x.type === "enum" ? (
        <ListOrdered className="h-3 w-3" />
      ) : (
        <CalendarDays className="h-3 w-3" />
      );
    const input =
      x.type === "search" ? (
        <BoardFilterInput
          name={x.name}
          value={filterValue[x.name] ?? x.defaultValue}
          onChange={(v) => {
            if (!onFilterValueChange) return;
            onFilterValueChange(
              produce(filterValue, (draft) => {
                draft[x.name] = v;
              })
            );
          }}
        />
      ) : x.type === "enum" ? (
        <BoardFilterEnum
          name={x.name}
          enums={x.value.split(",")}
          value={filterValue[x.name] ?? x.defaultValue}
          onChange={(v) => {
            if (!onFilterValueChange) return;
            onFilterValueChange(
              produce(filterValue, (draft) => {
                draft[x.name] = v;
              })
            );
          }}
        />
      ) : (
        <BoardFilterDate
          name={x.name}
          value={filterValue[x.name] ?? x.defaultValue}
          onChange={(v) => {
            if (!onFilterValueChange) return;
            onFilterValueChange(
              produce(filterValue, (draft) => {
                draft[x.name] = v;
              })
            );
          }}
        />
      );
    return (
      <div
        key={i}
        className="bg-secondary flex items-center rounded-md text-sm"
      >
        <div className="border-background flex items-center gap-1 border-r-[1px] border-solid px-2 py-1">
          {icon}
          {x.name}
        </div>
        <div
          className={
            x.defaultValue ? "px-2 py-1" : "text-muted-foreground px-2 py-1"
          }
        >
          {input}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="hover:bg-background mr-2 cursor-pointer rounded-md p-1">
              <Ellipsis className="h-3 w-3" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="text-xs"
              onClick={() => {
                setSelectIndex(i);
                setOpen(true);
              }}
            >
              Edit filter
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs"
              onClick={() => {
                const value = produce(props.value, (draft) => {
                  draft.data.filters = props.value.data.filters.filter(
                    (_, idx) => idx !== i
                  );
                });
                storage
                  ?.save(value)
                  .then()
                  .finally(() => {
                    props.onChange(value);
                  });
              }}
            >
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  });

  return (
    <>
      <div className="sticky top-0 z-50 bg-neutral-100 px-1 pt-0 pb-2 dark:bg-neutral-950">
        <BoardToolbar
          show={show}
          onChangeShow={setShow}
          interval={props.interval}
          onChange={props.onChangeInterval}
          onRefresh={props.onRefresh}
          onSave={onSave}
          onCancel={props.onCancel}
          value={props.value}
          onChangeValue={props.onChange}
        />
        <div className={show ? "px-2 pt-4" : "hidden"}>
          {open && selectIndex !== undefined && (
            <BoardFilterDialog
              onClose={() => {
                setOpen(false);
                if (props.value.data.filters[selectIndex].new === true) {
                  const value = produce(props.value, (draft) => {
                    draft.data.filters = props.value.data.filters.filter(
                      (_, i) => i !== selectIndex
                    );
                  });
                  props.onChange(value);
                  setSelectIndex(undefined);
                }
              }}
              filter={props.value.data.filters[selectIndex]}
              onFilter={(v) => {
                const data = structuredClone(props.value.data.filters);
                data[selectIndex] = v;
                const value = produce(props.value, (draft) => {
                  draft.data.filters = data;
                });
                props.onChange(value);
              }}
              onAddFilter={() => {
                const data = structuredClone(props.value.data.filters);
                data[selectIndex].new = false;
                setOpen(false);
                const value = produce(props.value, (draft) => {
                  draft.data.filters = data;
                });
                storage
                  ?.save(value)
                  .then()
                  .finally(() => {
                    props.onChange(value);
                  });
              }}
            />
          )}
          <div className="flex flex-wrap gap-3">
            {mapFilterItem}
            <button
              className={buttonVariants({ size: "sm", variant: "ghost" })}
              onClick={onFilter}
            >
              <ListFilter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
