import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("CrossWay", function () {
  async function setup() {
    const [, alice, bob, carol] = await ethers.getSigners();
    const token = await ethers.deployContract("MockERC20");
    const pay = await ethers.deployContract("CrossWay");
    await pay.setToken(await token.getAddress(), true);
    for (const s of [alice, bob, carol]) {
      await token.mint(s.address, 1_000_000_000);
      await token.connect(s).approve(await pay.getAddress(), ethers.MaxUint256);
    }
    return { alice, bob, carol, token, pay };
  }

  it("sends to address, username, email, and user id", async function () {
    const { alice, bob, token, pay } = await loadFixture(setup);
    const t = await token.getAddress();
    const exp = (await time.latest()) + 86_400;
    await pay.connect(alice).sendToAddress(bob.address, t, 10_000_000, "0x6869");
    await pay.connect(bob).register(await pay.USERNAME(), "bob");
    await pay.connect(bob).register(await pay.EMAIL(), "bob@example.com");
    await pay.connect(bob).register(await pay.USER_ID(), "user-42");
    await pay.connect(alice).sendTo(await pay.USERNAME(), "bob", t, 1_000_000, exp, "0x");
    await pay.connect(alice).sendTo(await pay.EMAIL(), "bob@example.com", t, 2_000_000, exp, "0x");
    await pay.connect(alice).sendTo(await pay.USER_ID(), "user-42", t, 3, exp, "0x");
    expect(await token.balanceOf(bob.address)).to.equal(1_013_000_003);
  });

  it("holds then claims when identity is registered", async function () {
    const { alice, bob, token, pay } = await loadFixture(setup);
    const exp = (await time.latest()) + 86_400;
    await pay.connect(alice).sendTo(await pay.EMAIL(), "bob@example.com", await token.getAddress(), 7_000_000, exp, "0x");
    expect(await token.balanceOf(await pay.getAddress())).to.equal(7_000_000);
    await pay.connect(bob).register(await pay.EMAIL(), "bob@example.com");
    expect(await token.balanceOf(bob.address)).to.equal(1_007_000_000);
    expect((await pay.pendings(1)).from).to.equal(ethers.ZeroAddress);
  });

  it("refunds after expiry", async function () {
    const { alice, token, pay } = await loadFixture(setup);
    const exp = (await time.latest()) + 86_400;
    await pay.connect(alice).sendTo(await pay.USERNAME(), "ghost", await token.getAddress(), 3_000_000, exp, "0x");
    await time.increaseTo(exp);
    await pay.connect(alice).refund(1);
    expect(await token.balanceOf(alice.address)).to.equal(1_000_000_000);
    expect((await pay.pendings(1)).from).to.equal(ethers.ZeroAddress);
  });

  it("requests, links, redeems, and cancels", async function () {
    const { alice, bob, carol, token, pay } = await loadFixture(setup);
    const t = await token.getAddress();
    const exp = (await time.latest()) + 86_400;
    await pay.connect(bob).createRequest(alice.address, t, 2_000_000, exp, "0x");
    await pay.connect(alice).pay(1, "0x");
    await pay.connect(alice).register(await pay.USERNAME(), "alice");
    await pay.connect(bob).createRequestTo(await pay.USERNAME(), "alice", t, 4_000_000, exp, "0x");
    await expect(pay.connect(carol).pay(2, "0x")).to.be.revertedWithCustomError(pay, "NotPayer");
    await pay.connect(alice).pay(2, "0x");
    await pay.connect(bob).createLink(t, 5_000_000, exp, "0x");
    await pay.connect(carol).pay(3, "0x");
    await pay.connect(bob).createLink(t, 1, exp, "0x");
    await pay.connect(bob).cancel(4);
    await expect(pay.connect(alice).pay(4, "0x")).to.be.revertedWithCustomError(pay, "Closed");
    expect(await token.balanceOf(bob.address)).to.equal(1_011_000_000);
    expect((await pay.invoices(1)).payee).to.equal(ethers.ZeroAddress);
    expect((await pay.invoices(4)).payee).to.equal(ethers.ZeroAddress);
  });
});
