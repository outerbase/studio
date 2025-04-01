/**
 * Provides human-readable values for __cf_KV by deserializing V8 serialized data.
 * Implements a simplified version with limited supported types sufficient for our needs.
 *
 * Reference: https://github.com/v8/v8/blob/master/src/objects/value-serializer.cc
 */

/**
 * Class to track object references during deserialization
 */
class ObjectRegistry {
  private objects: Map<number, unknown> = new Map();
  private nextId: number = 0;

  /**
   * Register an object and get its ID
   */
  register(obj: unknown): number {
    const id = this.nextId++;
    this.objects.set(id, obj);
    return id;
  }

  /**
   * Get an object by its ID
   */
  get(id: number): unknown {
    const obj = this.objects.get(id);
    if (obj === undefined) {
      throw new Error(
        `Object reference not found: ${id} (available: ${[...this.objects.keys()].join(", ")})`
      );
    }
    return obj;
  }
}

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
    // Create a registry to track objects for reference handling
    const registry = new ObjectRegistry();
    const [value] = deserializeValue(df, 2, registry);
    return { value };
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      return { error: e.message, value: undefined };
    }
    return { error: "Deserialization failed", value: undefined };
  }
}

function deserializeValue(
  df: DataView,
  offset: number,
  registry: ObjectRegistry = new ObjectRegistry()
): [unknown, number] {
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
    // Undefined value
    case "_".charCodeAt(0): {
      // Undefined
      return [undefined, offset + 1];
    }
    // Double precision floating point
    case "N".charCodeAt(0): {
      // Double (8 bytes, 64-bit IEEE 754)
      const value = df.getFloat64(offset + 1, true); // true = little endian
      return [value, offset + 1 + 8];
    }
    // BigInt
    case "Z".charCodeAt(0): {
      return deserializeBigInt(df, offset + 1);
    }
    // Date
    case "D".charCodeAt(0): {
      // Date: milliseconds since epoch as double (8 bytes, 64-bit IEEE 754)
      const millisSinceEpoch = df.getFloat64(offset + 1, true); // true = little endian
      return [new Date(millisSinceEpoch), offset + 1 + 8];
    }
    case "A".charCodeAt(0): {
      return deserializeDenseJSArray(df, offset + 1, registry);
    }
    case "o".charCodeAt(0): {
      // JavaScript Object
      return deserializeJSObject(df, offset + 1, registry);
    }
    // Object reference
    case "^".charCodeAt(0): {
      // Reference to a previously deserialized object
      const [refId, bytesRead] = decodeVarint(df, offset + 1);
      const referencedObject = registry.get(refId);
      return [referencedObject, offset + 1 + bytesRead];
    }

    default:
      throw new Error(
        `Unsupported type: ${String.fromCharCode(type)} (${type})`
      );
  }
}

/**
 * Deserializes a JavaScript object
 * @param df DataView containing the serialized data
 * @param offset Current offset in the DataView (after the type byte)
 * @param registry Registry to track object references
 */
function deserializeJSObject(
  df: DataView,
  offset: number,
  registry: ObjectRegistry
): [Record<string | number, unknown>, number] {
  const obj: Record<string | number, unknown> = {};

  // Register the object before populating it (enables handling circular references)
  registry.register(obj);

  let currentOffset = offset;
  let propertyCount = 0;

  // Keep reading key-value pairs until we find the end marker
  while (df.getUint8(currentOffset) !== "{".charCodeAt(0)) {
    // Read property key
    const [key, keyOffset] = deserializeValue(df, currentOffset, registry);
    currentOffset = keyOffset;

    // Read property value
    const [value, valueOffset] = deserializeValue(df, currentOffset, registry);
    currentOffset = valueOffset;

    // Set property on object
    if (typeof key === "string" || typeof key === "number") {
      obj[key] = value;
    }

    propertyCount++;
  }

  // Skip the end marker
  currentOffset++;

  // Read numProperties for validation
  const [numProperties, propBytesRead] = decodeVarint(df, currentOffset);
  currentOffset += propBytesRead;

  // Validate that we read the expected number of properties
  if (propertyCount !== numProperties) {
    throw new Error(
      `Expected ${numProperties} properties, but read ${propertyCount}`
    );
  }

  return [obj, currentOffset];
}

/**
 * Deserializes a dense JavaScript array
 * @param df DataView containing the serialized data
 * @param offset Current offset in the DataView (after the type byte)
 * @param registry Registry to track object references
 */
function deserializeDenseJSArray(
  df: DataView,
  offset: number,
  registry: ObjectRegistry
): [unknown[], number] {
  const array: unknown[] = [];

  // Register the array before populating it (enables handling circular references)
  registry.register(array);

  const [length, bytesRead] = decodeVarint(df, offset);
  let currentOffset = offset + bytesRead;

  // Read each array element
  for (let i = 0; i < length; i++) {
    const [value, nextOffset] = deserializeValue(df, currentOffset, registry);
    array.push(value);
    currentOffset = nextOffset;
  }

  // Check for the end marker
  if (df.getUint8(currentOffset) !== "$".charCodeAt(0)) {
    throw new Error("Expected end of array marker");
  }

  // Skip the end marker
  currentOffset++;

  // Read numProperties and length
  const [numProperties, propBytesRead] = decodeVarint(df, currentOffset);
  currentOffset += propBytesRead;

  const [arrayLength, lengthBytesRead] = decodeVarint(df, currentOffset);
  currentOffset += lengthBytesRead;

  // Read properties if any (key-value pairs)
  for (let i = 0; i < numProperties; i++) {
    // Read property key
    const [key, keyOffset] = deserializeValue(df, currentOffset, registry);
    currentOffset = keyOffset;

    // Read property value
    const [value, valueOffset] = deserializeValue(df, currentOffset, registry);
    currentOffset = valueOffset;

    // Set property on array
    if (typeof key === "string" || typeof key === "number") {
      (array as any)[key] = value;
    }
  }

  // Set the array length to match the serialized length
  array.length = arrayLength;

  return [array, currentOffset];
}

/**
 * Deserializes a BigInt value
 * @param df DataView containing the serialized data
 * @param offset Current offset in the DataView (after the type byte)
 */
function deserializeBigInt(df: DataView, offset: number): [bigint, number] {
  // Read the bitfield which contains both sign and length information
  const [bitfield, bytesReadForBitfield] = decodeVarint(df, offset);

  // Extract sign from the bitfield (lowest bit is the sign: 0 = positive, 1 = negative)
  const isNegative = (bitfield & 1) === 1;

  // Calculate the byte length (based on V8's implementation)
  // The length is stored in the upper bits of the bitfield
  const byteLength = Math.floor(bitfield / 2); // Simplified approximation

  // Read the bytes for the BigInt digits
  const digitsStart = offset + bytesReadForBitfield;
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
