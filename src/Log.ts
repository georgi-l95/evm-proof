import { Log } from "ethers";
import { Utils } from "./utils/utils";

export class SerializedLog {
  static fromRpc(rpcResult: Log) {
    let topics: Buffer[] = [];

    for (var i = 0; i < rpcResult.topics.length; i++) {
      topics.push(Utils.toBuffer(rpcResult.topics[i]));
    }
    const address = Utils.toBuffer(rpcResult.address);
    const data = Utils.toBuffer(rpcResult.data);

    return [address, topics, data];
  }
}
