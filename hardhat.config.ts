import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";
dotenv.config();

// // added to try etherscan verification
// require("@nomiclabs/hardhat-etherscan");

// const config: HardhatUserConfig = {
//   solidity: "0.8.24",
// };
const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";
const etherScanApiKey = process.env.ETHERSCAN_API_KEY || "";

// below changing to public network.
// const config: HardhatUserConfig = {
//   solidity: "0.8.24",
//   networks: {
//     sepolia: {
//       url: "https://ethereum-sepolia-rpc.publicnode.com",
//     },
//   },
// };
// need to add privateKey to work;
const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
  },
  // etherscan: {
  //   apiKey: etherScanApiKey,
  // },
};

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.viem.getWalletClients();
  for (const account of accounts) {
    console.log(account.account.address);
  }
});

export default config;
