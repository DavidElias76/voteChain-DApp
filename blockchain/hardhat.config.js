require("@nomicfoundation/hardhat-ethers");
require("dotenv").config({ path: "../server/.env" });

module.exports = {
  solidity: "0.8.19",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
};