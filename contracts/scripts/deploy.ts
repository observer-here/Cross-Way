import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const fee = { maxFeePerGas: 20_000_000_000n, maxPriorityFeePerGas: 0n };
  const pay = await ethers.deployContract("CrossWay", [], fee);
  await pay.waitForDeployment();
  console.log("deployer", deployer.address);
  console.log("CrossWay", await pay.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
