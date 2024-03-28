import { ReactElement } from "react";
import { OptimizeTableHeaderWithIndexProps } from ".";
import TableHeader from "./TableHeader";

export default function TableHeaderList({
  headers,
  onHeaderResize,
  renderHeader,
  sticky,
  onHeaderContextMenu,
}: {
  headers: OptimizeTableHeaderWithIndexProps[];
  renderHeader: (
    props: OptimizeTableHeaderWithIndexProps,
    idx: number
  ) => ReactElement;
  onHeaderResize: (idx: number, newWidth: number) => void;
  sticky: boolean;
  onHeaderContextMenu?: (
    e: React.MouseEvent,
    header: OptimizeTableHeaderWithIndexProps
  ) => void;
}) {
  return (
    <thead>
      <tr>
        {headers.map((header, idx) => {
          return (
            <TableHeader
              key={header.name}
              sticky={sticky && idx === 0}
              header={header}
              renderHeader={renderHeader}
              idx={idx}
              onHeaderResize={onHeaderResize}
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
