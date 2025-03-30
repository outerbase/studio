import { ReactElement } from "react";
import { OptimizeTableHeaderWithIndexProps } from ".";
import OptimizeTableState from "./optimize-table-state";
import TableHeader from "./table-header";

export default function TableHeaderList<HeaderMetadata = unknown>({
  headers,
  onHeaderResize,
  renderHeader,
  sticky,
  onHeaderContextMenu,
  state,
}: {
  headers: OptimizeTableHeaderWithIndexProps<HeaderMetadata>[];
  renderHeader: (
    props: OptimizeTableHeaderWithIndexProps<HeaderMetadata>
  ) => ReactElement;
  onHeaderResize: (idx: number, newWidth: number) => void;
  sticky: boolean;
  onHeaderContextMenu?: (
    e: React.MouseEvent,
    header: OptimizeTableHeaderWithIndexProps<HeaderMetadata>
  ) => void;
  state: OptimizeTableState<HeaderMetadata>;
}) {
  return (
    <thead>
      <tr>
        <th className="sticky left-0 z-30 bg-neutral-50 dark:bg-neutral-950">
          <div className="libsql-table-cell flex h-full items-center justify-end pr-2 font-mono font-bold"></div>
        </th>
        {headers.map((header, idx) => {
          return (
            <TableHeader
              key={header.name}
              sticky={sticky && idx === 0}
              header={header}
              renderHeader={renderHeader}
              idx={idx}
              onHeaderResize={onHeaderResize}
              state={state}
              onContextMenu={(e) => {
                if (onHeaderContextMenu) {
                  onHeaderContextMenu(e, header);
                  e.stopPropagation();
                }
              }}
            />
          );
        })}
      </tr>
    </thead>
  );
}
