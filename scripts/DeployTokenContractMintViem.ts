import { viem } from "hardhat";

import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
dotenv.config();
import { abi, bytecode } from "../artifacts/contracts/MyToken.sol/MyToken.json";
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
  console.log("Deployer address:", deployer.account.address);
  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log(
    "Deployer balance:",
    formatEther(balance),
    deployer.chain.nativeCurrency.symbol
  );

  const account2 = privateKeyToAccount(`0x${acc2PrivateKey}`);
  const acc2 = createWalletClient({
    account: account2,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  // const myTokenContract = await viem.deployContract("MyToken");
  // //   console.log("myTokenContract type = ", typeof myTokenContract);
  // console.log("deployer is ", deployer.account.address);
  // console.log(`Token contract deployed at ${myTokenContract.address}\n`);

  // console.log("\nDeploying Token contract");
  // const hashDeployToken = await deployer.deployContract({
  //   abi,
  //   bytecode: bytecode as `0x${string}`,
  //   args: [],
  // });
  // console.log("Transaction hash:", hashDeployToken);
  // console.log("Waiting for confirmations...");
  // const receiptDeployToken = await publicClient.waitForTransactionReceipt({
  //   hash: hashDeployToken,
  // });
  // console.log(
  //   "Token contract deployed to:",
  //   receiptDeployToken.contractAddress
  // );
  // const tokenContractAddress =
  //   receiptDeployToken.contractAddress as `0x${string}`;

  const tokenContractAddress = "0xA7C36711208b0D6c2dC417fD6fA806746194256D";
  const aaronAddress = "0xA9972292A1B7c82d191E79f34D7A493De48eDdEd";
  const joeBorAddress = "0xB1c4bB25346ad3F3de0019AE75eEa1ADAce201e8";

  const hash = await deployer.writeContract({
    address: tokenContractAddress,
    abi: abi,
    functionName: "mint",
    // args: [acc2.account.address, MINT_VALUE],
    args: [joeBorAddress, MINT_VALUE],
    // args: [aaronAddress, MINT_VALUE],
    // account: voterAccount,
    account: accountDeployer,
  });
  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmations...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Transaction confirmed");

  // const lastBlockNumber = await publicClient.getBlockNumber();
  // console.log("**** last block# before Tokenized Ballot = ", lastBlockNumber);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
