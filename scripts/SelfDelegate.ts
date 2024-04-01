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

  // const tokenContractAddress = "0xA7C36711208b0D6c2dC417fD6fA806746194256D";  // Mine
  const tokenContractAddress = "0xD38d61ab91E134D01a6DbB48b0D2a0C181B4B936"; // Joe-bo2's

  // Self delegate
  const hash = await deployer.writeContract({
    address: tokenContractAddress,
    abi: abi,
    functionName: "delegate",
    // args: [acc2.account.address],
    args: [deployer.account.address], // self delegate for Joe's Token contract
    // account: voterAccount,
    account: deployer.account,
  });
  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmations...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Transaction confirmed");

  const votes = (await publicClient.readContract({
    address: tokenContractAddress,
    abi: abi,
    functionName: "getVotes",
    args: [deployer.account.address],
    // }));
  })) as bigint;
  console.log(
    `Account ${deployer.account.address} has          ${formatEther(
      votes
    )} units of voting power\n`
    //  ${votes.toString()} units of voting power before self delegating\n`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
