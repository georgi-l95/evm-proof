import { Trie } from "@ethereumjs/trie";
import { TransactionReceipt } from "ethers";
import { JsonRpcProvider } from "ethers";
import { Errors } from "./errors/ProoferErrors";
import { Block } from "ethers";
import { VerboseLevel } from "./types/VerboseLevel";
import { Logger } from "./Logger";
import { Utils } from "./utils/utils";
import { Receipt } from "./Receipt";

export class Proofer {
  private readonly provider: JsonRpcProvider;
  private readonly logger: Logger;

  constructor(url: string, verboseLevel: VerboseLevel) {
    this.provider = new JsonRpcProvider(url);
    this.logger = new Logger(verboseLevel);
  }

  async createReceiptProof(txHash: string) {
    this.logger.info(`Initiating receipt proof creation.`);
    const targetReceipt = await this.getTransactionReceipt(
      this.provider,
      txHash
    );
    this.logger.info(`Receipt ${txHash} was fetched successfully.`);

    const block = await this.getBlock(this.provider, targetReceipt.blockHash);
    const txHashes = block.transactions;
    this.logger.info(`Block ${block.hash} was fetched succesfully.`);

    const receipts = await this.getAllReceiptsInBlock(txHashes);
    const trie = new Trie();

    receipts.map((receipt, index) => {
      let path = Utils.encode(index);
      let serializedReceipt = Utils.encode(Receipt.fromRpc(receipt));
      this.logger.debug(
        `Serializing key ${path} and value ${serializedReceipt}`
      );
    });
  }

  private async getAllReceiptsInBlock(
    txHashes: readonly string[]
  ): Promise<TransactionReceipt[]> {
    let receiptsFetched = 0;
    const receipts: TransactionReceipt[] = [];
    for (let i = 0; i < txHashes.length; i++) {
      const txHash = txHashes[i];

      this.logger.debug(`Trying to fetch receipt for transaction: ${txHash}`);
      const receipt = await this.getTransactionReceipt(this.provider, txHash);
      receipts.push(receipt);

      receiptsFetched++;
      this.logger.debug(
        `Receipt ${txHash} was fetched successfully. ${
          txHashes.length - receiptsFetched
        } more remaining.`
      );
    }

    if (receiptsFetched != txHashes.length) {
      throw Errors.RECEIPTS_RETRIEVAL_ERROR();
    }
    this.logger.info(`All receipts from the target block have been fetched.`);
    return receipts;
  }

  private async getTransactionReceipt(
    provider: JsonRpcProvider,
    txHash: string
  ): Promise<TransactionReceipt> {
    const receipt = await provider.getTransactionReceipt(txHash);
    if (receipt === null) {
      throw Errors.RECEIPT_RETRIEVAL_ERROR();
    }
    return receipt;
  }

  private async getBlock(
    provider: JsonRpcProvider,
    blockHash: string
  ): Promise<Block> {
    const block = await provider.getBlock(blockHash, false);
    if (block === null) {
      throw Errors.BLOCK_RETRIEVAL_ERROR();
    }
    return block;
  }
}
