import { Proof, Trie } from "@ethereumjs/trie";
import { TransactionReceipt } from "ethers";
import { JsonRpcProvider } from "ethers";
import { Errors } from "./errors/ProoferErrors";
import { Block } from "ethers";
import { Logger } from "./Logger";
import { Utils } from "./utils/utils";
import { Options } from "./types/Options";
import { hexToBytes } from "@ethereumjs/util";

export class Proofer {
  private readonly provider: JsonRpcProvider;
  private readonly logger: Logger;

  constructor(url: string, options?: Options) {
    this.provider = new JsonRpcProvider(url);
    this.logger = new Logger(options?.verboseLevel);
  }

  async getReceiptProof(txHash: string): Promise<Proof> {
    this.logger.info(`Initiating receipt proof creation...`);
    const targetReceipt = await this.getTransactionReceipt(
      this.provider,
      txHash
    );
    this.logger.info(`Receipt ${txHash} was fetched successfully.`);

    const block = await this.getBlock(this.provider, targetReceipt.blockHash);
    const txHashes = block.transactions;
    const txHashesCount = txHashes.length;

    this.logger.info(`Block ${block.hash} was fetched succesfully.`);
    this.logger.info(
      `Collecting all ${txHashesCount} receipts from block ${block.number}...`
    );

    const receipts = await this.getAllReceiptsInBlock(txHashes);
    const trie = new Trie();

    receipts.map(async (receipt) => {
      let path = Utils.encode(receipt.index);
      let serializedReceipt = Utils.encodeReceipt(receipt, receipt.type);

      this.logger.debug(
        `Serializing key ${path} and adding to trie together with value.`
      );
      await trie.put(path, serializedReceipt);
    });
    trie.checkpoint();
    await trie.commit();

    const transacitonIndexSerialized = Utils.encode(targetReceipt.index);
    this.logger.info(
      `Creating proof for receipt with transaction index ${transacitonIndexSerialized}...`
    );

    const proof = await trie.createProof(transacitonIndexSerialized);
    return proof;
  }

  async verifyReceiptProof(
    txHash: string,
    proof: Proof
  ): Promise<Uint8Array | null> {
    this.logger.info(`Initiating receipt proof verification...`);
    const targetReceipt = await this.getTransactionReceipt(
      this.provider,
      txHash
    );
    this.logger.info(`Receipt ${txHash} was fetched successfully.`);

    const block = await this.getBlock(this.provider, targetReceipt.blockHash);

    this.logger.info(`Block ${block.hash} was fetched succesfully.`);

    const transacitonIndexSerialized = Utils.encode(targetReceipt.index);
    this.logger.info(
      `Verifying proof for receipt with transaction index ${transacitonIndexSerialized}...`
    );

    const value = await new Trie().verifyProof(
      hexToBytes(block.receiptsRoot!),
      transacitonIndexSerialized,
      proof
    );

    return value;
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
