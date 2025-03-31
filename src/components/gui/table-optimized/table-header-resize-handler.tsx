import { useEffect, useRef, useState } from "react";

export default function TableHeaderResizeHandler({
  idx,
  onResize,
}: {
  idx: number;
  onResize: (idx: number, newSize: number) => void;
}) {
  const handlerRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    if (handlerRef.current && resizing) {
      const table = handlerRef.current?.parentNode?.parentNode?.parentNode
        ?.parentNode as HTMLTableElement;

      const tableWrapper = table.parentNode?.parentNode as HTMLDivElement;

      let lastX = -100;

      if (table && tableWrapper) {
        const onMouseMove = (e: MouseEvent) =>
          requestAnimationFrame(() => {
            if (lastX < 0) {
              lastX = e.clientX;
              return;
            }

            const edgeDirection =
              tableWrapper.getBoundingClientRect().right - e.clientX > 0
                ? 1
                : -1;
            const edgeResizing =
              Math.abs(tableWrapper.getBoundingClientRect().right - e.clientX) <
              3;

            let gain = 0;
            if (edgeResizing) {
              gain = edgeDirection * 2;
            } else {
              gain = e.clientX - lastX;
            }

            const cell = handlerRef.current?.parentNode as HTMLTableCellElement;
            const cellWidth = cell.getBoundingClientRect().width;

            let width = cellWidth;
            if (cellWidth + gain >= 100) {
              width = cellWidth + gain;
            } else {
              width = 100;
              gain = 0;
            }

            lastX = e.clientX;
            if (edgeResizing) {
              tableWrapper.scrollLeft += gain;
            }

            onResize(idx - 1, width);

            if (table) {
              const columns = table.style.gridTemplateColumns.split(" ");
              columns[idx] = width + "px";
              table.style.gridTemplateColumns = columns.join(" ");
            }

            if (edgeResizing) {
              tableWrapper.scrollLeft += gain;
            }
          });

        const onMouseUp = () => {
          setResizing(false);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        return () => {
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };
      }
    }
  }, [handlerRef, idx, resizing, setResizing, onResize]);

  return (
    <div
      className={
        "absolute top-0 right-0 bottom-0 w-[10px] cursor-col-resize opacity-0 hover:opacity-50"
      }
      ref={handlerRef}
      onMouseDown={() => setResizing(true)}
    ></div>
  );
}
