import { PropsWithChildren } from "react";

export default function TableFakeBodyPadding({
  children,
  colCount,
  rowHeight,
  rowCount,
  rowStart,
  rowEnd,
}: PropsWithChildren<{
  rowHeight: number;
  colCount: number;
  rowCount: number;
  rowStart: number;
  rowEnd: number;
}>) {
  const paddingTop = rowStart * rowHeight;
  const paddingBottom = (rowCount - rowEnd) * rowHeight;

  return (
    <tbody className="contents">
      {!!paddingTop && (
        <tr key="padding-top" className="contents">
          <td
            style={{
              height: paddingTop,
              gridColumn: `span ${colCount + 1}`,
            }}
          />
        </tr>
      )}

      {children}

      {!!paddingBottom && (
        <tr className="contents" key="padding-bottom">
          <td
            style={{
              height: paddingBottom,
              gridColumn: `span ${colCount + 1}`,
            }}
          ></td>
        </tr>
      )}
    </tbody>
  );
}
