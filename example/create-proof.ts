import { Proofer } from "../src/Proofer";

async function main() {
  const txHash =
    "0x60e9457c912a502f13f264814c600adb66b73649e6ad39e69617037d433f0d3e";
  const providerUrl =
    "https://sepolia.infura.io/v3/65571be8303e4b7d95c854a7d81ac69b";
  const proofer = new Proofer(providerUrl);

  const proof = await proofer.getReceiptProof(txHash);
}
main();
