import createEditableCell from "./create-editable-cell";

const NumberCell = createEditableCell<number>({
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

    const parsedNumber = Number(v);
    if (Number.isFinite(parsedNumber)) {
      return parsedNumber;
    }
    return null;
  },
});

export default NumberCell;
