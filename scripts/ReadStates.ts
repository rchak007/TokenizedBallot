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

  const tokenContractAddress = "0xA7C36711208b0D6c2dC417fD6fA806746194256D";
  const tokenizedBallotContractAddress =
    "0xd95fdfe538f0ce7d3e8cb7a16af7af1cd9e60ebd"; // Test1
  const aaronAddress = "0xA9972292A1B7c82d191E79f34D7A493De48eDdEd";
  const joeBorAddress = "0xB1c4bB25346ad3F3de0019AE75eEa1ADAce201e8";

  const tokenContractRead = (await publicClient.readContract({
    address: tokenizedBallotContractAddress,
    abi: abiTB,
    functionName: "tokenContract",
    args: [],
    // }));
  })) as `0x${string}`;
  console.log(
    `Tokenized Contract ${tokenizedBallotContractAddress} is using Token contract -  ${tokenContractRead} \n`
  );

  const targetBlockNumber = (await publicClient.readContract({
    address: tokenizedBallotContractAddress,
    abi: abiTB,
    functionName: "targetBlockNumber",
    args: [],
    // }));
  })) as bigint;
  console.log(
    `Tokenized Contract ${tokenizedBallotContractAddress} has Block Number -  ${targetBlockNumber} \n`
  );

  // ************************   READ PROPOSALS from contract -

  let bigPropInd: bigint = 0n;
  let propInd: number = 0;
  let keepLoopingProp: boolean = true;
  while (keepLoopingProp) {
    try {
      const proposalsRaw = (await publicClient.readContract({
        address: tokenizedBallotContractAddress,
        abi: abiTB,
        functionName: "proposals",
        args: [bigPropInd],
        // }));
      })) as any[];
      const name = hexToString(proposalsRaw[0]);
      console.log("Proposal ", bigPropInd, " = ", name);
      bigPropInd += 1n;
    } catch (error) {
      console.log("all proposals read ");
      // console.error("Error fetching proposal: ", error);
      keepLoopingProp = false;
    }
  }

  const winnerName = (await publicClient.readContract({
    address: tokenizedBallotContractAddress,
    abi: abiTB,
    functionName: "winnerName",
    args: [],
    // }));
  })) as `0x${string}`;
  const stringValueAfter: `0x${string}` = winnerName as `0x${string}`;
  console.log("Winning name = ", hexToString(stringValueAfter));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
