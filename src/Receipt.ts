import { TransactionReceipt } from "ethers";
import { SerializedLog } from "./Log";
import { Utils } from "./utils/utils";

export class Receipt {
  static fromRpc(rpcResult: TransactionReceipt) {
    let logs: unknown[] = [];
    for (var i = 0; i < rpcResult.logs.length; i++) {
      logs.push(SerializedLog.fromRpc(rpcResult.logs[i]));
    }
    const status = Utils.toBuffer(rpcResult.status || rpcResult.root);
    const cumulativeGasUsed = Utils.toBuffer(rpcResult.cumulativeGasUsed);
    const logsBloom = Utils.toBuffer(rpcResult.logsBloom);
    return [status, cumulativeGasUsed, logsBloom, logs];
  }
}
