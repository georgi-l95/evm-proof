import { RLP } from "@ethereumjs/rlp";
import {
  intToHex,
  isHexString,
  padToEven,
  stripHexPrefix,
} from "@ethereumjs/util";

export class Utils {
  static encode(input: any) {
    return input === "0x0" ? RLP.encode(Buffer.alloc(0)) : RLP.encode(input);
  }

  static decode(input: number | string) {
    return RLP.decode(input);
  }

  static toBuffer(input: any): Buffer {
    return input === "0x0" ? Buffer.alloc(0) : Utils._toBuffer(input);
  }

  static _toBuffer(v) {
    if (!Buffer.isBuffer(v)) {
      if (Array.isArray(v)) {
        v = Buffer.from(v);
      } else if (typeof v === "string") {
        if (isHexString(v)) {
          v = Buffer.from(padToEven(stripHexPrefix(v)), "hex");
        } else {
          v = Buffer.from(v);
        }
      } else if (typeof v === "number") {
        v = Utils.intToBuffer(v);
      } else if (v === null || v === undefined) {
        v = Buffer.allocUnsafe(0);
      } else if (typeof v === "bigint") {
        v = BigInt(v).toString(16);
        v = Buffer.from(v);
      } else if (v.toArray) {
        // converts a BN to a Buffer
        v = Buffer.from(v.toArray());
      } else {
        throw new Error("invalid type");
      }
    }
    return v;
  }

  static intToBuffer(i) {
    var hex = intToHex(i);

    return new Buffer(padToEven(hex.slice(2)), "hex");
  }
}
