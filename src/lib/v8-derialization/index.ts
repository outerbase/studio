/**
 * Provides human-readable values for __cf_KV by deserializing V8 serialized data.
 * Implements a simplified version with limited supported types sufficient for our needs.
 *
 * Reference: https://github.com/v8/v8/blob/master/src/objects/value-serializer.cc
 */

interface DeserializationResponse {
  error?: string;
  value: unknown;
}

export function deserializeV8(buffer: ArrayBuffer): DeserializationResponse {
  const df = new DataView(buffer);

  // Check if the first byte is 0xFF
  if (df.getUint8(0) !== 0xff) {
    return { error: "Invalid data format", value: undefined };
  }

  // Check if the second byte is 0x0F
  if (df.getUint8(1) !== 0x0f) {
    return {
      error: "We only support deserialize version 15",
      value: undefined,
    };
  }

  try {
    const [value] = deserializeValue(df, 2);
    return { value };
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      return { error: e.message, value: undefined };
    }
    return { error: "Deserialization failed", value: undefined };
  }
}

function deserializeValue(df: DataView, offset: number): [unknown, number] {
  const type = df.getUint8(offset);

  switch (type) {
    // ZigZag-encoded signed 32-bit integer (like sint32 in protobuf)
    case "I".charCodeAt(0): {
      const [value, bytesRead] = decodeZigZag(df, offset + 1);
      return [value, offset + 1 + bytesRead];
    }
    case "U".charCodeAt(0): {
      // Varint-encoded unsigned 32-bit integer
      const [value, bytesRead] = decodeVarint(df, offset + 1);
      return [value, offset + 1 + bytesRead];
    }
    case "c".charCodeAt(0): {
      // Two-byte string (UTF-16)
      return deserializeString(df, offset + 1, "utf-16le");
    }
    case '"'.charCodeAt(0): {
      // One-byte ASCII string
      return deserializeString(df, offset + 1, "ascii");
    }
    case "S".charCodeAt(0): {
      // UTF-8 string
      return deserializeString(df, offset + 1, "utf-8");
    }
    // Boolean values
    case "F".charCodeAt(0): {
      // Boolean false
      return [false, offset + 1];
    }
    case "T".charCodeAt(0): {
      // Boolean true
      return [true, offset + 1];
    }
    // Null value
    case "0".charCodeAt(0): {
      // Null
      return [null, offset + 1];
    }
    // Double precision floating point
    case "N".charCodeAt(0): {
      // Double (8 bytes, 64-bit IEEE 754)
      const value = df.getFloat64(offset + 1, true); // true = little endian
      return [value, offset + 1 + 8];
    }
    // BigInt
    case "Z".charCodeAt(0): {
      // Read the bitfield which contains both sign and length information
      const [bitfield, bytesReadForBitfield] = decodeVarint(df, offset + 1);

      // Extract sign from the bitfield (lowest bit is the sign: 0 = positive, 1 = negative)
      const isNegative = (bitfield & 1) === 1;

      // Calculate the byte length (based on V8's implementation)
      // The length is stored in the upper bits of the bitfield
      const byteLength = Math.floor(bitfield / 2); // Simplified approximation

      // Read the bytes for the BigInt digits
      const digitsStart = offset + 1 + bytesReadForBitfield;
      let bigintValue = 0n;

      // Read each byte and build the BigInt
      for (let i = 0; i < byteLength; i++) {
        // BigInts are stored in little-endian format in V8
        const byte = df.getUint8(digitsStart + i);
        bigintValue = bigintValue + (BigInt(byte) << BigInt(8 * i));
      }

      // Apply sign
      if (isNegative) {
        bigintValue = -bigintValue;
      }

      return [bigintValue, digitsStart + byteLength];
    }
    default:
      throw new Error(
        `Unsupported type: ${String.fromCharCode(type)} (${type})`
      );
  }
}

/**
 * Helper function to deserialize string values
 * @param df DataView containing the serialized data
 * @param offset Current offset in the DataView (after the type byte)
 * @param encoding String encoding to use for decoding
 */
function deserializeString(
  df: DataView,
  offset: number,
  encoding: string
): [string, number] {
  const [length, lengthBytesRead] = decodeVarint(df, offset);

  // Calculate string data offset and create view
  const stringStart = offset + lengthBytesRead;
  const stringBytes = new Uint8Array(
    df.buffer,
    df.byteOffset + stringStart,
    length
  );

  // Decode using the specified encoding
  const decoder = new TextDecoder(encoding);
  const value = decoder.decode(stringBytes);

  return [value, stringStart + length];
}

// Decode a varint (variable-length integer encoding)
function decodeVarint(df: DataView, offset: number): [number, number] {
  let result = 0;
  let shift = 0;
  let bytesRead = 0;
  let currentByte;

  do {
    if (shift >= 32) {
      throw new Error("Varint is too large");
    }

    currentByte = df.getUint8(offset + bytesRead);
    bytesRead++;

    // Add the lower 7 bits to the result
    result |= (currentByte & 0x7f) << shift;
    shift += 7;
  } while (currentByte & 0x80); // Continue if the high bit is set

  return [result >>> 0, bytesRead]; // Ensure unsigned 32-bit
}

// Decode a ZigZag encoded value
function decodeZigZag(df: DataView, offset: number): [number, number] {
  const [value, bytesRead] = decodeVarint(df, offset);
  // ZigZag decoding: (value >> 1) ^ -(value & 1)
  const decoded = (value >>> 1) ^ -(value & 1);
  return [decoded, bytesRead];
}
