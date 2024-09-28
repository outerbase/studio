import OptimizeTable, {
  OptimizeTableHeaderWithIndexProps,
} from "@/components/gui/table-optimized";
import OptimizeTableState from "@/components/gui/table-optimized/OptimizeTableState";
import { KEY_BINDING } from "@/lib/key-matcher";
import {
  LucideChevronDown,
  LucidePin,
  LucideSortAsc,
  LucideSortDesc,
} from "lucide-react";
import React, {
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from "react";
import { ColumnSortOption } from "@/drivers/base-driver";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import useTableResultContextMenu from "./table-result/context-menu";

interface ResultTableProps {
  data: OptimizeTableState;
  tableName?: string;
  onSortColumnChange?: (columns: ColumnSortOption[]) => void;
  sortColumns?: ColumnSortOption[];
  visibleColumnIndexList?: number[];
}

function Header({
  children,
  header,
}: PropsWithChildren<{ header: OptimizeTableHeaderWithIndexProps }>) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu modal={false} onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <div
          className="flex grow items-center px-2 overflow-hidden"
          onContextMenu={() => {
            setOpen(true);
          }}
        >
          {header.icon ? <div className="mr-2">{header.icon}</div> : null}
          <div className="grow line-clamp-1 font-mono font-bold">
            {header.displayName}
          </div>
          <LucideChevronDown className="text-mute w-4 h-4 cursor-pointer flex-shrink-0" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={"w-[300px]"}
        side="bottom"
        align="start"
        sideOffset={0}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ResultTable({
  data,
  tableName,
  onSortColumnChange,
  visibleColumnIndexList,
}: ResultTableProps) {
  const [stickyHeaderIndex, setStickHeaderIndex] = useState<number>();

  const headerIndex = useMemo(() => {
    if (visibleColumnIndexList) return visibleColumnIndexList;
    return data.getHeaders().map((_, idx) => idx);
  }, [data, visibleColumnIndexList]);

  const renderHeader = useCallback(
    (header: OptimizeTableHeaderWithIndexProps) => {
      const foreignKeyInfo = header.foreignKey ? (
        <div className="p-2">
          <div className="text-xs p-2 bg-yellow-200 text-black rounded">
            <h2 className="font-semibold">Foreign Key</h2>
            <p className="mt-1 font-mono">
              {header.foreignKey.foreignTableName}.
              {(header.foreignKey.foreignColumns ?? [])[0]}
            </p>
          </div>
        </div>
      ) : undefined;

      const generatedExpression =
        header.headerData?.constraint?.generatedExpression;
      const generatedInfo = generatedExpression ? (
        <div className="p-2">
          <div className="text-xs p-2 bg-blue-200 text-black rounded">
            <h2 className="font-semibold">Generated Expression</h2>
            <pre className="text-sm">
              <code>{generatedExpression}</code>
            </pre>
          </div>
        </div>
      ) : undefined;

      return (
        <Header header={header}>
          {foreignKeyInfo}
          {generatedInfo}
          <DropdownMenuItem
            onClick={() => {
              setStickHeaderIndex(
                header.index === stickyHeaderIndex ? undefined : header.index
              );
            }}
          >
            <LucidePin className="w-4 h-4 mr-2" />
            Pin Header
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!tableName}
            onClick={() => {
              if (onSortColumnChange) {
                onSortColumnChange([{ columnName: header.name, by: "ASC" }]);
              }
            }}
          >
            <LucideSortAsc className="w-4 h-4 mr-2" />
            Sort A → Z
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!tableName}
            onClick={() => {
              if (onSortColumnChange) {
                onSortColumnChange([{ columnName: header.name, by: "DESC" }]);
              }
            }}
          >
            <LucideSortDesc className="w-4 h-4 mr-2" />
            Sort Z → A
          </DropdownMenuItem>
        </Header>
      );
    },
    [stickyHeaderIndex, tableName, onSortColumnChange]
  );

  const onHeaderContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const copyCallback = useCallback((state: OptimizeTableState) => {
    const focus = state.getFocus();
    if (focus) {
      const y = focus.y;
      const x = focus.x;
      window.navigator.clipboard.writeText(state.getValue(y, x) as string);
    }
  }, []);

  const pasteCallback = useCallback((state: OptimizeTableState) => {
    const focus = state.getFocus();
    if (focus) {
      const y = focus.y;
      const x = focus.x;
      window.navigator.clipboard.readText().then((pasteValue) => {
        state.changeValue(y, x, pasteValue);
      });
    }
  }, []);

  const onCellContextMenu = useTableResultContextMenu({
    tableName,
    data,
    copyCallback,
    pasteCallback,
  });

  const onKeyDown = useCallback(
    (state: OptimizeTableState, e: React.KeyboardEvent) => {
      if (state.isInEditMode()) return;

      if (KEY_BINDING.copy.match(e as React.KeyboardEvent<HTMLDivElement>)) {
        copyCallback(state);
      } else if (
        KEY_BINDING.paste.match(e as React.KeyboardEvent<HTMLDivElement>)
      ) {
        pasteCallback(state);
      } else if (e.key === "ArrowRight") {
        const focus = state.getFocus();
        if (focus && focus.x + 1 < state.getHeaderCount()) {
          state.setFocus(focus.y, focus.x + 1);
          state.scrollToFocusCell("right", "top");
        }
      } else if (e.key === "ArrowLeft") {
        const focus = state.getFocus();
        if (focus && focus.x - 1 >= 0) {
          state.setFocus(focus.y, focus.x - 1);
          state.scrollToFocusCell("left", "top");
        }
      } else if (e.key === "ArrowUp") {
        const focus = state.getFocus();
        if (focus && focus.y - 1 >= 0) {
          state.setFocus(focus.y - 1, focus.x);
          state.scrollToFocusCell("left", "top");
        }
      } else if (e.key === "ArrowDown") {
        const focus = state.getFocus();
        if (focus && focus.y + 1 < state.getRowsCount()) {
          state.setFocus(focus.y + 1, focus.x);
          state.scrollToFocusCell("left", "bottom");
        }
      } else if (e.key === "Tab") {
        const focus = state.getFocus();
        if (focus) {
          const colCount = state.getHeaderCount();
          const n = focus.y * colCount + focus.x + 1;
          const x = n % colCount;
          const y = Math.floor(n / colCount);
          if (y >= state.getRowsCount()) return;
          state.setFocus(y, x);
          state.scrollToFocusCell(x === 0 ? "left" : "right", "bottom");
        }
      } else if (e.key === "Enter") {
        state.enterEditMode();
      }

      e.preventDefault();
    },
    [copyCallback, pasteCallback]
  );

  return (
    <OptimizeTable
      internalState={data}
      onContextMenu={onCellContextMenu}
      onHeaderContextMenu={onHeaderContextMenu}
      stickyHeaderIndex={stickyHeaderIndex}
      arrangeHeaderIndex={headerIndex}
      renderAhead={20}
      renderHeader={renderHeader}
      rowHeight={35}
      onKeyDown={onKeyDown}
    />
  );
}
