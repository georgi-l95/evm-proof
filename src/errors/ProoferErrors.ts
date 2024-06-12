class ProoferErrors extends Error {
  constructor(name: string, message: string) {
    super();
    name = this.name;
    message = this.message;
  }
}

export const Errors = {
  RECEIPT_RETRIEVAL_ERROR: () =>
    new ProoferErrors(
      "Receipt Retrieval Error",
      `Something went wrong, while trying to retrieve the receipt from provider. Check if tx hash and/or provider url are correct.`
    ),
  BLOCK_RETRIEVAL_ERROR: () =>
    new ProoferErrors(
      "Block Retrieval Error",
      `Something went wrong, while trying to retrieve the block from provider. Check if block hash and/or provider url are correct.`
    ),
  RECEIPTS_RETRIEVAL_ERROR: () =>
    new ProoferErrors(
      "Receipts Retrieval Error",
      `Something went wrong, while trying to retrieve the receipts from all transactions in the block.`
    ),
};
