const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const fs = require("fs");

async function deploy() {
    const [owner, acct1] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("BTC1155");
    const contract = await Contract.deploy();
    return { owner, acct1, contract };
}
describe("Deployment", function () {
    it("Deployment", async function deployed() {
        const { owner, contract} = await loadFixture(deploy);
        add = owner.address;
        expect(await contract.owner()).to.equal(owner.address);
        await hre.network.provider.send("hardhat_mine", ["0x10000000"]);
        // Block reward test: Done
        console.log(await contract.getBlockReward);
        for (i=0; i<1030; i++){
            await contract.mine({value: ethers.utils.parseEther("0.001")});
        }
        console.log(await contract.getBlockReward());
        console.log(await contract.getCurrentChainStatus());
        // Convert test: Done
        console.log(await contract.getReserves(), await contract.balanceOfBatch([add, add, add, add, add], [0, 1, 2, 3, 4]));
        await contract.connect(owner).convertSATtoBTC(300000000);
        console.log(await contract.getReserves(), await contract.balanceOfBatch([add, add, add, add, add], [0, 1, 2, 3, 4]));
        await contract.connect(owner).convertBTCtoSAT(3);
        console.log(await contract.getReserves(), await contract.balanceOfBatch([add, add, add, add, add], [0, 1, 2, 3, 4]));
        // Add liquidity test.
        console.log(await contract.getETHNeededToAddLiquidity(0, 1000000));

    });
});

describe("Mint", function (){
    it("mint 5", async function () {
        const { owner, contract, acct1 } = await loadFixture(deploy);
        //await contract.connect(owner).mint(2, {value: ethers.utils.parseEther("0.02048")});
    });
});
