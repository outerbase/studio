import { prettifyBytes } from "@/components/gui/table-cell/generic-cell";
import createEditableCell from "./create-editable-cell";

const BlobCell = createEditableCell<number[]>({
  toString: (v) => {
    if (v === null) return null;
    if (v === undefined) return undefined;

    return prettifyBytes(Uint8Array.from(v ?? []));
  },
  toValue: (v) => {
    if (v === null) return null;
    if (v === undefined) return undefined;
    if (v === "") return null;

    return [...v.matchAll(/(\\\\)|\\x([0-9a-f]{2})|(.)/gi)].map(
      ([, escape, hex, letter]) =>
        escape !== undefined
          ? 0x5c
          : letter !== undefined
            ? letter.codePointAt(0)
            : parseInt(hex, 16)
    ) as number[];
  },
});

export default BlobCell;
