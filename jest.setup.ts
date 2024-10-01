import crypto from "crypto";

Object.defineProperty(window, "crypto", {
  value: {
    randomUUID: crypto.randomUUID,
  },
});
