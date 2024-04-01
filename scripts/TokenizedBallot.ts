import { viem } from "hardhat";
import { toHex, hexToString, parseEther, formatEther } from "viem";

const MINT_VALUE = parseEther("10");
const PROPOSALS = ["vanilla", "strawberry", "chocolate"];

async function delegateAndGetVoteCount(
  publicClient: any,
  myTokenContract: any,
  signer: { address: string }
) {
  const delegateTx = await myTokenContract.write.delegate([signer.address], {
    account: signer,
  });
  const delegateReceipt = await publicClient.getTransactionReceipt({
    hash: delegateTx,
  });
  const lastBlockDel = delegateReceipt.blockNumber;
  console.log("**** last block# after delegation = ", lastBlockDel);

  const votes = await myTokenContract.read.getVotes([signer.address]);
  console.log(
    `Account ${signer.address} has          ${formatEther(
      votes
    )} units of voting power before delegating\n`
    //  ${votes.toString()} units of voting power before self delegating\n`
  );
}

// Define a new function for minting
async function mintTokens(
  myTokenContract: any,
  mintToAccount: { address: string },
  publicClient: any,
  amount: bigint,
  signer: { address: string }
) {
  const mintTx = await myTokenContract.write.mint(
    [mintToAccount.address, amount],
    {
      account: signer,
    }
  );
  const mintTxReceipt = await publicClient.getTransactionReceipt({
    hash: mintTx,
  });
  //   console.log("Mint mintTx = ", mintTx);
  //   console.log("Mint mintTxReceipt = ", mintTxReceipt);
  const effectiveGasPrice = mintTxReceipt.effectiveGasPrice;
  const gasUsed = mintTxReceipt.gasUsed;
  console.log("Mint effective gas used = ", effectiveGasPrice);
  console.log("Mint Gas Used = ", gasUsed);
}

async function main() {
  const publicClient = await viem.getPublicClient();
  //   console.log("publicClient type = ", typeof publicClient);
  const [deployer, acc1, acc2, acc3, acc4] = await viem.getWalletClients();
  const myTokenContract = await viem.deployContract("MyToken");
  //   console.log("myTokenContract type = ", typeof myTokenContract);
  console.log("deployer is ", deployer.account.address);
  console.log(`Token contract deployed at ${myTokenContract.address}\n`);

  // mintTokens for acc1.
  await mintTokens(
    myTokenContract,
    acc1.account,
    publicClient,
    MINT_VALUE,
    deployer.account // has minter role
  );
  const acc1TokenBalance = await myTokenContract.read.balanceOf([
    acc1.account.address,
  ]);
  console.log("Acc1 myToken balance = ", acc1TokenBalance);

  // Now that acc1 has Token they delegate it
  await delegateAndGetVoteCount(publicClient, myTokenContract, acc1.account);

  // mintTokens for acc2
  await mintTokens(
    myTokenContract,
    acc2.account,
    publicClient,
    MINT_VALUE,
    deployer.account // has minter role
  );
  const acc2TokenBalance = await myTokenContract.read.balanceOf([
    acc1.account.address,
  ]);
  console.log("Acc2 myToken balance = ", acc2TokenBalance);

  const lastBlockNumber = await publicClient.getBlockNumber();
  console.log("**** last block# before Tokenized Ballot = ", lastBlockNumber);

  // After acc1 delegated now we create the Tokenized Ballot
  const tokenizedBallotContract = await viem.deployContract("TokenizedBallot", [
    PROPOSALS.map((prop) => toHex(prop, { size: 32 })),
    myTokenContract.address,
    lastBlockNumber,
  ]);
  console.log(
    `Tokenized Ballot contract deployed at ${tokenizedBallotContract.address}\n`
  );

  // ************************   READ PROPOSALS from contract -
  let bigPropInd: bigint = 0n;
  let propInd: number = 0;
  let keepLoopingProp: boolean = true;
  while (keepLoopingProp) {
    try {
      const proposalsRaw = (await tokenizedBallotContract.read.proposals([
        bigPropInd,
      ])) as any[];
      const name = hexToString(proposalsRaw[0]);
      console.log("Proposal ", bigPropInd, " = ", name);
      bigPropInd += 1n;
    } catch (error) {
      console.log("all proposals read ");
      // console.error("Error fetching proposal: ", error);
      keepLoopingProp = false;
    }
  }

  const winnerNameBeforeHex: string =
    await tokenizedBallotContract.read.winnerName();
  const stringValue: `0x${string}` = winnerNameBeforeHex as `0x${string}`;
  console.log("Winning name Before = ", hexToString(stringValue));

  // Now 1st vote from acc1
  const voteTx = await tokenizedBallotContract.write.vote(
    [1n, acc1TokenBalance],
    {
      account: acc1.account,
    }
  );

  const winnerNameAfterHex: string =
    await tokenizedBallotContract.read.winnerName();
  const stringValueAfter: `0x${string}` = winnerNameAfterHex as `0x${string}`;
  console.log("Winning name After = ", hexToString(stringValueAfter));

  // Now that acc2 has Token they delegate it
  await delegateAndGetVoteCount(publicClient, myTokenContract, acc2.account);

  // mintTokens for acc4 past the Tokenized Ballot creation
  await mintTokens(
    myTokenContract,
    acc4.account,
    publicClient,
    MINT_VALUE,
    deployer.account // has minter role
  );
  const acc4TokenBalance = await myTokenContract.read.balanceOf([
    acc1.account.address,
  ]);
  console.log("Acc4 myToken balance = ", acc1TokenBalance);

  // Now that acc4 has Token they delegate it
  await delegateAndGetVoteCount(publicClient, myTokenContract, acc4.account);

  // Now vote from acc2
  const voteTx2 = await tokenizedBallotContract.write.vote(
    [1n, acc2TokenBalance],
    {
      account: acc2.account,
    }
  );

  // Now vote from acc4
  const voteTx4 = await tokenizedBallotContract.write.vote(
    [1n, acc4TokenBalance],
    {
      account: acc4.account,
    }
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
