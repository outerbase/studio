"use client";
import { produce } from "immer";
import {
  CalendarDays,
  Check,
  Ellipsis,
  ListFilter,
  ListOrdered,
  Search,
} from "lucide-react";
import { useCallback, useState } from "react";
import { DashboardProps } from ".";
import { buttonVariants } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { BoardFilterDialog, DEFAULT_DATE_FILTER } from "./board-filter-dialog";
import { useBoardContext } from "./board-provider";
import { BoardTool } from "./board-tool/board-tool";
import { BoardToolbar } from "./board-tool/board-toolbar";

interface Props {
  editMode: "ADD_CHART" | "REARRANGING_CHART" | null;
  onChangeEditMode: (v: "ADD_CHART" | "REARRANGING_CHART" | null) => void;
  interval: number;
  onChangeInterval: (v: number) => void;
  onRefresh?: () => void;
  onCancel: () => void;
  value: DashboardProps;
  onChange: (v: DashboardProps) => void;
}

export function BoardFilter(props: Props) {
  const { onLayoutSave } = useBoardContext();
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
        <input
          placeholder={`Enter ${x.name}`}
          value={x.defaultValue}
          onChange={(v) => {
            const data = structuredClone(props.value.data.filters);
            data[i].defaultValue = v.target.value;
            const value = produce(props.value, (draft) => {
              draft.data.filters = data;
            });
            props.onChange(value);
          }}
          className="max-w-14 outline-0"
        />
      ) : x.type === "enum" ? (
        <div className="z-100">
          <Popover>
            <PopoverTrigger asChild>
              <div
                className={
                  x.defaultValue
                    ? "px-2 py-1"
                    : "text-muted-foreground px-2 py-1"
                }
              >
                <div>{x.defaultValue || `Select ${x.name}`}</div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto">
              {x.value.split(",").map((v, idx) => {
                return (
                  <div
                    key={v + idx}
                    className="flex items-center justify-center gap-2"
                  >
                    <Checkbox
                      id={v + idx}
                      checked={x.defaultValue.split(",").includes(v)}
                      onCheckedChange={(checked) => {
                        const valueString = x.defaultValue.split(",");
                        const data = structuredClone(props.value.data.filters);

                        if (checked) {
                          data[i].defaultValue = [...valueString, v]
                            .filter((f) => !!f)
                            .join(",");
                        } else {
                          valueString.filter((f) => f !== v);
                          data[i].defaultValue = valueString
                            .filter((f) => f !== v)
                            .join(",");
                        }
                        const value = produce(props.value, (draft) => {
                          draft.data.filters = data;
                        });
                        props.onChange(value);
                      }}
                    />
                    <label htmlFor={v + idx}>{v}</label>
                  </div>
                );
              })}
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={
                x.defaultValue ? "px-2 py-1" : "text-muted-foreground px-2 py-1"
              }
            >
              <div>{x.defaultValue || `Select ${x.name}`}</div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {DEFAULT_DATE_FILTER.map((date) => {
              return (
                <DropdownMenuItem
                  key={date}
                  onClick={() => {
                    const data = structuredClone(props.value.data.filters);
                    data[i].defaultValue = date;
                    const value = produce(props.value, (draft) => {
                      draft.data.filters = data;
                    });
                    props.onChange(value);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {date}
                    {date === x.defaultValue && <Check className="h-3 w-3" />}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    return (
      <div
        key={i}
        className="bg-secondary flex items-center rounded-md text-xs"
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
                props.onChange(value);
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
      <BoardTool
        editMode={props.editMode}
        setEditMode={props.onChangeEditMode}
      />
      <div className="sticky top-0 z-50 bg-neutral-100 px-1 pt-0 pb-2 dark:bg-neutral-950">
        <BoardToolbar
          show={show}
          onChangeShow={setShow}
          interval={props.interval}
          onChange={props.onChangeInterval}
          onRefresh={props.onRefresh}
          mode={props.editMode}
          onSave={() => {
            props.onChangeEditMode(null);
            onLayoutSave();
          }}
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
                props.onChange(value);
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
