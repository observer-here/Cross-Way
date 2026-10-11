import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("CrossWay", function () {
  async function setup() {
    const [owner, alice, bob, carol] = await ethers.getSigners();
    const token = await ethers.deployContract("MockERC20");
    const pay = await ethers.deployContract("CrossWay");
    await pay.setToken(await token.getAddress(), true);
    for (const s of [alice, bob, carol]) {
      await token.mint(s.address, 1_000_000_000);
      await token.connect(s).approve(await pay.getAddress(), ethers.MaxUint256);
    }
    return { owner, alice, bob, carol, token, pay };
  }

  it("sends to an address and takes 0.5% fee", async function () {
    const { owner, alice, bob, token, pay } = await loadFixture(setup);
    await pay.connect(alice).sendToAddress(bob.address, await token.getAddress(), 10_000_000, "0x6869");
    expect(await token.balanceOf(bob.address)).to.equal(1_009_950_000);
    expect(await token.balanceOf(owner.address)).to.equal(50_000);
  });

  it("requests, links, redeems, and cancels", async function () {
    const { alice, bob, carol, token, pay } = await loadFixture(setup);
    const t = await token.getAddress();
    const exp = (await time.latest()) + 86_400;
    await pay.connect(bob).createRequest(alice.address, t, 2_000_000, exp, "0x");
    await pay.connect(alice).pay(1, "0x");
    await pay.connect(bob).createRequest(alice.address, t, 4_000_000, exp, "0x");
    await expect(pay.connect(carol).pay(2, "0x")).to.be.revertedWithCustomError(pay, "NotPayer");
    await pay.connect(alice).pay(2, "0x");
    await pay.connect(bob).createLink(t, 5_000_000, exp, "0x");
    await pay.connect(carol).pay(3, "0x");
    await pay.connect(bob).createLink(t, 1, exp, "0x");
    await pay.connect(bob).cancel(4);
    await expect(pay.connect(alice).pay(4, "0x")).to.be.revertedWithCustomError(pay, "Closed");
    expect(await token.balanceOf(bob.address)).to.equal(1_010_945_000);
    expect((await pay.invoices(1)).payee).to.equal(ethers.ZeroAddress);
    expect((await pay.invoices(4)).payee).to.equal(ethers.ZeroAddress);
  });
});
