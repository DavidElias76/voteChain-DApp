import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.waitForDeployment();

  const contractAddress = await voting.getAddress();
  console.log("Voting contract deployed to:", contractAddress);

  const contractInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  const artifactPath = path.join(__dirname, "../artifacts/contracts/Voting.sol/Voting.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // Save to client
  const clientDir = path.join(__dirname, "../../client/src/contracts");
  if (!fs.existsSync(clientDir)) fs.mkdirSync(clientDir, { recursive: true });
  fs.writeFileSync(
    path.join(clientDir, "Voting.json"),
    JSON.stringify({ ...contractInfo, abi: artifact.abi }, null, 2)
  );

  // Save to server
  const serverDir = path.join(__dirname, "../../server/config");
  if (!fs.existsSync(serverDir)) fs.mkdirSync(serverDir, { recursive: true });
  fs.writeFileSync(
    path.join(serverDir, "contract.json"),
    JSON.stringify({ ...contractInfo, abi: artifact.abi }, null, 2)
  );

  console.log("✅ Done! Contract saved to client and server.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });