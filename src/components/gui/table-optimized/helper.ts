import OptimizeTableState from "./optimize-table-state";

export function createSimpleTableState(
  headers: string[],
  data: Record<string, unknown>[]
) {
  return new OptimizeTableState(
    headers.map((header) => ({
      name: header,
      display: {
        initialSize: 150,
        text: header,
      },
      sticky: false,
      metadata: {
        isPrimaryKey: false,
      },
      setting: {
        readonly: true,
        resizable: true,
      },
      store: new Map(),
    })),
    data
  );
}
