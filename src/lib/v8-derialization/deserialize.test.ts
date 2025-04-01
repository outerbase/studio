import { deserializeV8 } from ".";

function p(hex: string) {
  const buffer = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    buffer[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }

  return deserializeV8(buffer.buffer);
}

describe("V8 Deserialization", () => {
  it("positive small number", () => {
    expect(p("FF0F4906").value).toBe(3);
  });

  it("negative number", () => {
    expect(p("FF0F4905").value).toBe(-3);
  });

  it("positive large number", () => {
    expect(p("FF0F4994B0BEDF01").value).toBe(234343434);
  });

  it("string", () => {
    expect(p("FF0F220B68656C6C6F20776F726C64").value).toBe("hello world");
  });

  it("unicode string", () => {
    expect(p("FF0F6308604F7D59164E4C75").value).toBe("你好世界");
  });

  it("true", () => {
    expect(p("FF0F54").value).toBe(true);
  });

  it("false", () => {
    expect(p("FF0F46").value).toBe(false);
  });

  it("null", () => {
    expect(p("FF0F30").value).toBe(null);
  });

  it("double", () => {
    expect(p("FF0F4E1F85EB51B81E0940").value).toBeCloseTo(3.14);
  });

  it("big number", () => {
    expect(p("FF0F5A10D20A1FEB8CA954AB").value).toBe(12345678901234567890n);
  });

  it("array", () => {
    expect(p("FF0F4103220568656C6C6F2205776F726C64490A240003").value).toEqual([
      "hello",
      "world",
      5,
    ]);
  });

  it("object", () => {
    expect(
      p("FF0F6F220568656C6C6F2205776F726C6422066E756D626572490A7B02")
        .value as Record<string, unknown>
    ).toEqual({ hello: "world", number: 5 });
  });
});
