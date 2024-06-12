import { RLP } from "@ethereumjs/rlp";
import { TransactionType } from "@ethereumjs/tx";
import { Log as SerializedLog } from "@ethereumjs/evm";
import {
  bigIntToBytes,
  concatBytes,
  hexToBytes,
  intToBytes,
  intToHex,
  isHexString,
  padToEven,
  stripHexPrefix,
} from "@ethereumjs/util";
import { TransactionReceipt, Log } from "ethers";
import { keccak256 } from "ethers";

export class Utils {
  static encode(input: any) {
    return input === "0x0" ? RLP.encode(Buffer.alloc(0)) : RLP.encode(input);
  }

  static keccak(input: any) {
    return keccak256(input);
  }

  static decode(input: number | string) {
    return RLP.decode(input);
  }

  static toBuffer(input: any): Buffer {
    return input === "0x0" ? Buffer.alloc(0) : Utils._toBuffer(input);
  }

  static buffer2hex(buffer: Buffer) {
    return "0x" + buffer.toString("hex");
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

  static encodeReceipt(receipt: TransactionReceipt, txType: TransactionType) {
    const logs = (logs: Log[]): SerializedLog[] => {
      const serializedLog: SerializedLog[] = [];

      for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        let topics: Uint8Array[] = [];
        for (var j = 0; j < log.topics.length; j++) {
          topics.push(hexToBytes(log.topics[j]));
        }
        const address = hexToBytes(log.address);
        const data = hexToBytes(log.data);

        serializedLog.push([address, topics, data]);
      }

      return serializedLog;
    };

    const encoded = RLP.encode([
      receipt.root ??
        (receipt.status === 0 ? Uint8Array.from([]) : hexToBytes("0x01")),
      bigIntToBytes(receipt.cumulativeGasUsed),
      hexToBytes(receipt.logsBloom),
      logs(receipt.logs as Log[]),
    ]);

    if (txType === TransactionType.Legacy) {
      return encoded;
    }

    // Serialize receipt according to EIP-2718:
    // `typed-receipt = tx-type || receipt-data`
    return concatBytes(intToBytes(txType), encoded);
  }
}
