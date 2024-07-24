import createEditableCell from "./create-editable-cell";

const BigNumberCell = createEditableCell<bigint>({
  align: "right",
  toString: (v) => {
    if (v === null) return null;
    if (v === undefined) return undefined;
    return v.toString();
  },
  toValue: (v) => {
    if (v === null) return null;
    if (v === undefined) return undefined;
    if (v === "") return null;

    try {
      return BigInt(v);
    } catch {
      return null;
    }
  },
});

export default BigNumberCell;
