import createEditableCell from "./createEditableCell";

const TextCell = createEditableCell<string>({
  toString: (v) => v,
  toValue: (v) => v,
});

export default TextCell;
