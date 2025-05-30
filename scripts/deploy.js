const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const NKNguyenToken = await hre.ethers.getContractFactory("NKNguyenToken");
  const token = await NKNguyenToken.deploy();

  await token.waitForDeployment();  // ethers v6: wait for deployment

  console.log("NKNguyenToken deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
