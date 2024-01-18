import { OptimizeTableHeaderWithIndexProps } from '.';
import TableHeader from './TableHeader';

export default function TableHeaderList({
  headers,
  onHeaderResize,
  sticky,
}: {
  headers: OptimizeTableHeaderWithIndexProps[];
  onHeaderResize: (idx: number, newWidth: number) => void;
  sticky: boolean;
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
            />
          );
        })}
      </tr>
    </thead>
  );
}
