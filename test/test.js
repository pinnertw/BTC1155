const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const fs = require("fs");

async function deploy() {
    const [owner, acct1] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("BTC1155");
    const contract = await Contract.deploy();
    await hre.network.provider.send("hardhat_mine", ["0x10000000"]);
    await contract.mine({value: ethers.utils.parseEther("0.001")});
    await contract.mine({value: ethers.utils.parseEther("0.001")});
    await contract.mine({value: ethers.utils.parseEther("0.001")});
    await contract.mine({value: ethers.utils.parseEther("0.001")});
    await contract.mine({value: ethers.utils.parseEther("0.001")});
    return { owner, acct1, contract };
}
describe("Deployment", function () {
    it("Deployment", async function deployed() {
        const { owner, acct1, contract} = await loadFixture(deploy);
        expect(await contract.owner()).to.equal(owner.address);
    });
});
cst = 1e8;

describe("Mint", function (){
    it("Block Reward test.", async function () {
        const { owner, contract, acct1 } = await loadFixture(deploy);
        //await contract.connect(owner).mint(2, {value: ethers.utils.parseEther("0.02048")});
        // Block reward test: Done
        expect(await contract.getBlockReward()).to.equal(1 * cst);
        for (i=0; i<1030; i++){
            await contract.mine({value: ethers.utils.parseEther("0.001")});
        }
        expect(await contract.getBlockReward()).to.equal(0.5 * cst);
    });
    it("Convert SAT to BTC then back to SAT.", async function () {
        const { owner, contract, acct1 } = await loadFixture(deploy);
        //await contract.connect(owner).mint(2, {value: ethers.utils.parseEther("0.02048")});
        // Convert test: Done
        add = owner.address;
        expect(await contract.balanceOf(add, 2)).to.equal(0);
        expect(await contract.balanceOf(add, 3)).to.equal(5 * cst);
        await contract.connect(owner).convertSATtoBTC(300000000);
        expect(await contract.balanceOf(add, 2)).to.equal(3);
        expect(await contract.balanceOf(add, 3)).to.equal(2 * cst);
        await contract.connect(owner).convertBTCtoSAT(3);
        expect(await contract.balanceOf(add, 2)).to.equal(0);
        expect(await contract.balanceOf(add, 3)).to.equal(5 * cst);
    });
    it("Add liquidity test.", async function () {
        const { owner, contract, acct1 } = await loadFixture(deploy);
        // Add liquidity test.
        await contract.addLiquidity(0, 500000, {value: ethers.utils.parseEther("1")});
        expect(await contract.getETHNeededToAddLiquidity(0, 1000000)).to.equal(ethers.utils.parseEther("2"));
        await contract.removeLiquidity(await contract.balanceOf(owner.address, 4));
    });
    it("Swap test.", async function () {
        const { owner, contract, acct1 } = await loadFixture(deploy);
        addr = owner.address;
        // Transfer Test
        await contract.addLiquidity(0, 200000000, {value: ethers.utils.parseEther("1")});
        await contract.addLiquidity(0, 500000, {value: ethers.utils.parseEther("2")});
        console.log(await contract.getReserves(), await contract.balanceOfBatch([addr, addr], [2, 3]));

        // Specific SAT and back
        await contract.swapForExactSAT(100000000, {value: ethers.utils.parseEther("2")});
        await contract.swapForETH(0, 100000000);
        console.log(await contract.getReserves(), await contract.balanceOfBatch([addr, addr], [2, 3]));

        // Specific ETH and back
        await contract.swapForExactETH(ethers.utils.parseEther("0.5"));
        await contract.swapForSAT({value: ethers.utils.parseEther("0.5")});
        console.log(await contract.getReserves(), await contract.balanceOfBatch([addr, addr], [2, 3]));

        // Specific SAT and back, with BTC provided.
        await contract.swapForETH(1, 90000000);
        await contract.swapForExactSAT(190000000, {value: ethers.utils.parseEther("2")});
        console.log(await contract.getReserves(), await contract.balanceOfBatch([addr, addr], [2, 3]));
        // Specific SAT and back, a lots of SAT.
        await contract.swapForSAT({value: ethers.utils.parseEther("2")});
        await contract.swapForExactETH(ethers.utils.parseEther("2"));
        console.log(await contract.getReserves(), await contract.balanceOfBatch([addr, addr], [2, 3]));
        // Pool status.
        console.log(await contract.provider.getBalance(addr));
        await contract.withdraw(addr);
        console.log(await contract.provider.getBalance(addr));
        // Check if reserveETH is changed after withdraw.
        console.log(await contract.getReserves(), await contract.balanceOfBatch([addr, addr], [2, 3]));
        await contract.removeLiquidity(await contract.balanceOf(addr, 4));
        console.log(await contract.getReserves(), await contract.balanceOfBatch([addr, addr], [2, 3]));
    });
    it("Transfer test.", async function () {
        const { owner, contract, acct1 } = await loadFixture(deploy);
        addr = owner.address;
        addr2 = acct1.address;
        // Transfer test.
        await contract.convertSATtoBTC(5e8);
        expect(await contract.balanceOf(addr, 2)).to.equal(5);
        expect(await contract.balanceOf(addr, 3)).to.equal(0);
        // Case 3
        await contract.safeTransferFrom(owner.address, acct1.address, 2, 1, []);
        expect(await contract.balanceOf(addr, 2)).to.equal(3);
        expect(await contract.balanceOf(addr, 3)).to.equal(1e8 - 10);
        expect(await contract.balanceOf(addr2, 2)).to.equal(1);
        expect(await contract.balanceOf(addr2, 3)).to.equal(0);
        // Case 4
        await contract.connect(acct1).safeTransferFrom(acct1.address, owner.address, 2, 1, []);
        expect(await contract.balanceOf(addr, 2)).to.equal(3);
        expect(await contract.balanceOf(addr, 3)).to.equal(2e8 - 20);
        expect(await contract.balanceOf(addr2, 2)).to.equal(0);
        expect(await contract.balanceOf(addr2, 3)).to.equal(0);
        // Case 1
        await contract.safeTransferFrom(owner.address, acct1.address, 2, 1, []);
        expect(await contract.balanceOf(addr, 2)).to.equal(2);
        expect(await contract.balanceOf(addr, 3)).to.equal(2e8 - 30);
        expect(await contract.balanceOf(addr2, 2)).to.equal(1);
        expect(await contract.balanceOf(addr2, 3)).to.equal(0);
        // Case 1
        await contract.safeTransferFrom(owner.address, acct1.address, 3, 10, []);
        expect(await contract.balanceOf(addr, 2)).to.equal(2);
        expect(await contract.balanceOf(addr, 3)).to.equal(2e8 - 50);
        expect(await contract.balanceOf(addr2, 2)).to.equal(1);
        expect(await contract.balanceOf(addr2, 3)).to.equal(10);
        // Case 1
        await contract.connect(acct1).safeTransferFrom(acct1.address, owner.address, 2, 1, []);
        expect(await contract.balanceOf(addr, 2)).to.equal(3);
        expect(await contract.balanceOf(addr, 3)).to.equal(2e8 - 50);
        expect(await contract.balanceOf(addr2, 2)).to.equal(0);
        expect(await contract.balanceOf(addr2, 3)).to.equal(0);
        // Case 1
        await contract.safeTransferFrom(owner.address, acct1.address, 2, 2, []);
        expect(await contract.balanceOf(addr, 2)).to.equal(1);
        expect(await contract.balanceOf(addr, 3)).to.equal(2e8 - 60);
        expect(await contract.balanceOf(addr2, 2)).to.equal(2);
        expect(await contract.balanceOf(addr2, 3)).to.equal(0);
        // Case 3
        await contract.connect(acct1).safeTransferFrom(acct1.address, owner.address, 3, 0, []);
        expect(await contract.balanceOf(addr, 2)).to.equal(1);
        expect(await contract.balanceOf(addr, 3)).to.equal(2e8 - 60);
        expect(await contract.balanceOf(addr2, 2)).to.equal(1);
        expect(await contract.balanceOf(addr2, 3)).to.equal(1e8 - 10);
        // Case 2
        await contract.connect(acct1).safeTransferFrom(acct1.address, owner.address, 3, 1e8 - 15, []);
        expect(await contract.balanceOf(addr, 2)).to.equal(1);
        expect(await contract.balanceOf(addr, 3)).to.equal(3e8 - 80);
        expect(await contract.balanceOf(addr2, 2)).to.equal(1);
        expect(await contract.balanceOf(addr2, 3)).to.equal(0); // If balance < amount to transfer, then transfer balance - transaction fee to target. Rest 0 in funds.
        /// Multiple transfer
        // Case 1
        await contract.safeBatchTransferFrom(owner.address, acct1.address, [2, 3], [1, 1e8], []);
        expect(await contract.balanceOf(addr, 2)).to.equal(0);
        expect(await contract.balanceOf(addr, 3)).to.equal(2e8 - 90);
        expect(await contract.balanceOf(addr2, 2)).to.equal(2);
        expect(await contract.balanceOf(addr2, 3)).to.equal(1e8);
        // Case 2.
        await contract.connect(acct1).safeBatchTransferFrom(acct1.address, owner.address, [2, 3], [2, 1e8], []);
        expect(await contract.balanceOf(addr, 2)).to.equal(2);
        expect(await contract.balanceOf(addr, 3)).to.equal(3e8 - 100);
        expect(await contract.balanceOf(addr2, 2)).to.equal(0);
        expect(await contract.balanceOf(addr2, 3)).to.equal(0); 

        await contract.mine({value: ethers.utils.parseEther("0.001")});
        expect(await contract.balanceOf(addr, 3)).to.equal(4e8);
    });
});
