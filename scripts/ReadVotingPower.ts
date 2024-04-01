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

async function votes(
  publicClient: any,
  tokenContractAddress: any,
  signer: { address: string },
  text1: string
) {
  const votes = (await publicClient.readContract({
    address: tokenContractAddress,
    abi: abi,
    functionName: "getVotes",
    args: [signer.address],
    // }));
  })) as bigint;
  console.log(
    `Account ${text1} address -  ${signer.address} has          ${formatEther(
      votes
    )} units of voting power\n`
  );
}

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

  const tokenContractAddressMine = "0xA7C36711208b0D6c2dC417fD6fA806746194256D"; // Mine
  const tokenContractAddress = "0xD38d61ab91E134D01a6DbB48b0D2a0C181B4B936"; // Joe-bo2's

  // mintTokens for acc1.
  // await votes(publicClient, tokenContractAddress, deployer.account, "deployer");   // Joe bors
  await votes(publicClient, tokenContractAddressMine, account2, "Account2"); // Mine
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
