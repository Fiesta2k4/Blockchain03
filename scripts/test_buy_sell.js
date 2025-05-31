const hre = require("hardhat");
const { parseEther, formatEther } = require("ethers");

async function main() {
  const [owner, user1] = await hre.ethers.getSigners();
  const tokenAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const NKNguyenToken = await hre.ethers.getContractFactory("NKNguyenToken");
  const token = NKNguyenToken.attach(tokenAddress);

  // 1. User1 buys tokens (send 10 ETH)
  let buyTx = await token.connect(user1).buyTokens({ value: parseEther("10") });
  await buyTx.wait();
  let userBalance = await token.balanceOf(user1.address);
  console.log(`User1 token balance after buying: ${formatEther(userBalance)}`);

  // 2. User1 sells half their tokens back
  let sellAmount = userBalance / 2n; 
  let sellTx = await token.connect(user1).sellTokens(sellAmount);
  await sellTx.wait();

  userBalance = await token.balanceOf(user1.address);
  let contractETH = await hre.ethers.provider.getBalance(tokenAddress);
  console.log(`User1 token balance after selling: ${formatEther(userBalance)}`);
  console.log(`Contract ETH balance: ${formatEther(contractETH)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
