const hre = require("hardhat");

async function main() {
    const [owner, acct1, acct2] = await hre.ethers.getSigners();
    const PaperhandParadise = await hre.ethers.getContractFactory("BTC1155");
    const paperhandParadise = await PaperhandParadise.deploy({gasPrice: 30000000000});
    //await paperhandParadise.connect(owner).airDrop([owner.address, owner.address, owner.address, owner.address, owner.address, owner.address, owner.address]);
    console.log("Deployer: " + owner.address);
    console.log("Contract: " + paperhandParadise.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
