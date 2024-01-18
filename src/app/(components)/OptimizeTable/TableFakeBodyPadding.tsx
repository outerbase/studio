import { PropsWithChildren } from 'react';

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
    <tbody>
      {!!paddingTop && (
        <tr key="padding-top">
          <td
            style={{
              height: paddingTop,
              gridColumn: `span ${colCount}`,
            }}
          />
        </tr>
      )}

      {children}

      {!!paddingBottom && (
        <tr key="padding-bottom">
          <td
            style={{
              height: paddingBottom,
              gridColumn: `span ${colCount}`,
            }}
          ></td>
        </tr>
      )}
    </tbody>
  );
}
