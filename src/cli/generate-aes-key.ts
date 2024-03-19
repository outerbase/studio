import crypto from "crypto";

console.log("Generate Random Key:", crypto.randomBytes(32).toString("base64"));
