import { viem } from "hardhat";

import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
dotenv.config();
import {
  abi as abiT,
  bytecode as bytecodeT,
} from "../artifacts/contracts/MyToken.sol/MyToken.json";
import {
  abi as abiTB,
  bytecode as bytecodeTB,
} from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";

import {
  createPublicClient,
  http,
  createWalletClient,
  formatEther,
  toHex,
  hexToString,
  parseEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";
const acc2PrivateKey = process.env.PRIVATE_KEY2 || "";

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

const MINT_VALUE = parseEther("10");
const PROPOSALS = ["Defi", "Gaming", "DePin"];

const tokenContractAddressMine = "0xA7C36711208b0D6c2dC417fD6fA806746194256D";
const tokenizedBallotContractAddress =
  "0xd95fdfe538f0ce7d3e8cb7a16af7af1cd9e60ebd"; // Test1
const aaronAddress = "0xA9972292A1B7c82d191E79f34D7A493De48eDdEd";
const joeBorAddress = "0xB1c4bB25346ad3F3de0019AE75eEa1ADAce201e8";
const tokenContractAddress = "0xD38d61ab91E134D01a6DbB48b0D2a0C181B4B936"; // Joe-bo2's

async function main() {
  // const publicClient = await viem.getPublicClient();
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
  //   console.log("publicClient type = ", typeof publicClient);
  // const [deployer, acc1, acc2, acc3, acc4] = await viem.getWalletClients();

  const accountDeployer = privateKeyToAccount(`0x${deployerPrivateKey}`);
  const deployer = createWalletClient({
    account: accountDeployer,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const account2 = privateKeyToAccount(`0x${acc2PrivateKey}`);
  const acc2 = createWalletClient({
    account: account2,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  // const tokenContractAddress = "0xA7C36711208b0D6c2dC417fD6fA806746194256D";  // Mine

  // Vote
  const hash = await acc2.writeContract({
    address: tokenizedBallotContractAddress,
    abi: abiTB,
    functionName: "vote",
    // args: [acc2.account.address],
    args: [1n, 1n], // self delegate for Joe's Token contract
    // account: voterAccount,
    account: account2,
  });
  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmations...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Transaction confirmed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
