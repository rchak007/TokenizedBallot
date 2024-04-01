import { viem } from "hardhat";
import { parseEther, formatEther } from "viem";

const MINT_VALUE = parseEther("1");

async function main() {
  const publicClient = await viem.getPublicClient();
  const [deployer, acc1, acc2, acc3] = await viem.getWalletClients();
  const contract = await viem.deployContract("MyToken");
  console.log(`Token contract deployed at ${contract.address}\n`);

  // const ethBalanceBeforeDeployer = await publicClient.getBalance({
  //   address: deployer.account.address,
  // });
  // console.log("Before deployer ETH balance = ", ethBalanceBeforeDeployer);

  const mintTx = await contract.write.mint([acc1.account.address, MINT_VALUE]);
  const mintTxReceipt = await publicClient.getTransactionReceipt({
    hash: mintTx,
  });
  const effectiveGasPrice = mintTxReceipt.effectiveGasPrice;
  const gasUsed = mintTxReceipt.gasUsed;
  console.log("Mint effective gas used = ", effectiveGasPrice);
  console.log("Mint Gas Used = ", gasUsed);

  await publicClient.waitForTransactionReceipt({ hash: mintTx });
  // console.log(
  //   `Minted ${MINT_VALUE.toString()} decimal units to account ${
  //     acc1.account.address
  //   }\n`
  // );
  console.log(
    `Minted ${formatEther(MINT_VALUE)} decimal units to account ${
      acc1.account.address
    }\n`
  );

  const ethBalanceAfterAcc1 = await publicClient.getBalance({
    address: acc1.account.address,
  });
  console.log("After deploying ETH balance = ", ethBalanceAfterAcc1);
  const ethBalanceAfterDeployer = await publicClient.getBalance({
    address: acc1.account.address,
  });
  console.log("After deployer ETH balance = ", ethBalanceAfterDeployer);

  const balanceBN = await contract.read.balanceOf([acc1.account.address]);
  // console.log(
  //   `Account ${
  //     acc1.account.address
  //   } has ${balanceBN.toString()} decimal units of MyToken\n`
  // );
  console.log(
    `Account ${acc1.account.address} has ${formatEther(
      balanceBN
    )} decimal units of MyToken\n`
  );

  const delegateTx = await contract.write.delegate([acc1.account.address], {
    account: acc1.account,
  });
  const votes = await contract.read.getVotes([acc1.account.address]);
  console.log(
    `Account ${acc1.account.address} has          ${formatEther(
      votes
    )} units of voting power before self delegating\n`
    //  ${votes.toString()} units of voting power before self delegating\n`
  );

  // transfer them to acc2 now - half of them
  const transferTx = await contract.write.transfer(
    [acc2.account.address, MINT_VALUE / 2n],
    {
      account: acc1.account,
    }
  );
  // now show how many votes acct1 and acct 2 have.
  await publicClient.waitForTransactionReceipt({ hash: transferTx });
  const votes1AfterTransfer = await contract.read.getVotes([
    acc1.account.address,
  ]);
  console.log(
    `Account ${acc1.account.address} has ${formatEther(
      votes1AfterTransfer
    )} units of voting power after transferring\n`
  );
  //   } has ${votes1AfterTransfer.toString()} units of voting power after transferring\n`
  // );

  const votes2AfterTransfer = await contract.read.getVotes([
    acc2.account.address,
  ]);
  console.log(
    `Account ${acc2.account.address} has ${formatEther(
      votes2AfterTransfer
    )} units of voting power after receiving a transfer\n`
  );
  //   } has ${votes2AfterTransfer.toString()} units of voting power after receiving a transfer\n`
  // );

  // Now lets self delegate for acc2
  const delegateTxacc2 = await contract.write.delegate([acc2.account.address], {
    account: acc2.account,
  });
  const delegate2Receipt = await publicClient.getTransactionReceipt({
    hash: delegateTxacc2,
  });
  const lastBlockDel2 = delegate2Receipt.blockNumber;
  console.log("************* last block del2 = ", lastBlockDel2);
  // const mintTxReceipt = await publicClient.getTransactionReceipt({
  //   hash: mintTx,
  // });
  const votesAcc2AfterTransfer = await contract.read.getVotes([
    acc2.account.address,
  ]);
  console.log(
    `Account ${acc2.account.address} has ${formatEther(
      votesAcc2AfterTransfer
    )} units of voting power after receiving a transfer AND also self delegting\n`
  );

  //  create another block  -
  const transferTxExtra = await contract.write.transfer(
    [acc3.account.address, MINT_VALUE / 4n],
    {
      account: acc2.account,
    }
  );
  // now show how many votes acct1 and acct 2 have.
  const x = await publicClient.waitForTransactionReceipt({
    hash: transferTxExtra,
  });

  const lastBlockNumber = await publicClient.getBlockNumber();
  console.log("************* last block Number = ", lastBlockNumber);
  // for (let index = lastBlockNumber - 1n; index > 0n; index--) {
  //   const pastVotes = await contract.read.getPastVotes([
  //     acc1.account.address,
  //     index,
  //   ]);
  //   console.log(
  //     `Account ${
  //       acc1.account.address
  //     } had ${pastVotes.toString()} units of voting power for account 1 at block ${index}\n`
  //   );
  // }
  // now we do that for Account 2 also
  // for (let index2 = lastBlockNumber - 1n; index2 > 0n; index2--) {
  for (let index2 = lastBlockNumber - 1n; index2 > 0n; index2--) {
    const pastVotes2 = await contract.read.getPastVotes([
      acc2.account.address,
      index2,
    ]);
    console.log(
      `Account ${
        acc2.account.address
      } had ${pastVotes2.toString()} units of voting power for account 2 at block ${index2}\n`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
