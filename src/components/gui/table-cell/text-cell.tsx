import createEditableCell from "./create-editable-cell";

const TextCell = createEditableCell<string>({
  toString: (v) => v,
  toValue: (v) => v,
});

export default TextCell;
