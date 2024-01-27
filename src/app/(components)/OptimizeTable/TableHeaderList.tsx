import { OptimizeTableHeaderWithIndexProps } from ".";
import TableHeader from "./TableHeader";

export default function TableHeaderList({
  headers,
  onHeaderResize,
  sticky,
  onHeaderContextMenu,
}: {
  headers: OptimizeTableHeaderWithIndexProps[];
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
              idx={idx}
              onHeaderResize={onHeaderResize}
              onContextMenu={(e) => {}}
            />
          );
        })}
      </tr>
    </thead>
  );
}
