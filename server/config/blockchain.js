const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

let contractConfig;
try {
  contractConfig = require("./contract.json");
} catch {
  contractConfig = { address: null, abi: [] };
}

const getProvider = () => {
  const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
  return new ethers.JsonRpcProvider(rpcUrl);
};

const getContract = (signerOrProvider = null) => {
  if (!contractConfig.address) {
    throw new Error("Contract not deployed. Run deployment script first.");
  }
  const provider = signerOrProvider || getProvider();
  return new ethers.Contract(contractConfig.address, contractConfig.abi, provider);
};

const getAdminSigner = () => {
  const provider = getProvider();
  if (!process.env.ADMIN_PRIVATE_KEY) {
    throw new Error("ADMIN_PRIVATE_KEY not set in environment");
  }
  return new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
};

module.exports = { getProvider, getContract, getAdminSigner, contractConfig };