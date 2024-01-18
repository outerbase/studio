export default function TableFakeRowPadding({
  colStart,
  colEnd,
}: {
  colEnd: number;
  colStart: number;
}) {
  return colEnd - colStart > 0 ? (
    <td
      style={{
        gridColumn: `span ${colEnd - colStart}`,
      }}
    />
  ) : (
    <></>
  );
}
