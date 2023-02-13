import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

describe("ERC20", function () {
	async function deployContractFixture() {
		const [owner, otherAccount1, otherAccount2, otherAccount3] = await ethers.getSigners()
		const TestERC20 = await ethers.getContractFactory("ERC20")

		const name = "Test"
		const symbol = "TST"
		const price = ethers.utils.parseEther("0.1")
		const testERC20 = await TestERC20.deploy(name, symbol, price)

		return { owner, otherAccount1, otherAccount2, otherAccount3, name, symbol, price, testERC20 }
	}
	describe("Deployment", function () {
		it("Should deploy with proper address", async function () {})
		it("Should deploy with right name", async function () {})
		it("Should deploy with right symbol", async function () {})
		it("Should deploy with right price", async function () {})
		it("Should be 0 total supply after deploy", async function () {})
	})
	describe("Mint", function () {
		it("Should increase balance of caller on given amount", async function () {})
		it("Should increase total supply", async function () {})
		it("Should emit transfer event with right args", async function () {})
		it("Should increase contract ethers balance", async function () {})
		it("Should decrease caller ethers balance", async function () {})
		it("Should revert if message value is less than price * token amount", async function () {})
		it("Make tests for several mints for different addresses in one unit test", async function () {})
	})
	describe("Transfer", function () {
		it("Should increase balance of to address", async function () {})
		it("Should decrease balance of caller", async function () {})
		it("Should not change total supply", async function () {})
		it("Should emit transfer event with right args", async function () {})
		it("Should revert if to is a zero address", async function () {})
		it("Should revert if caller balance is less than amount to transfer", async function () {})
		it("Make tests for several transfers for different addresses in one unit test", async function () {})
	})
	describe("Burn", function () {
		it("Should decrease balance of caller", async function () {})
		it("Should decrease total supply", async function () {})
		it("Should emit transfer event with right args", async function () {})
		it("Should revert if caller balance is less than amount to burn", async function () {})
		it("Make tests for several burns for different addresses in one unit test", async function () {})
	})
	describe("Approve", function () {
		it("Should update _allowances mapping by setting amount", async function () {})
		it("Should emit approval event with right args", async function () {})
		it("Should revert if approval given for zero address", async function () {})
		it("Make tests for several approvals for different addresses in one unit test", async function () {})
	})
	describe("Increase allowance", function () {
		it("Should update _allowances mapping by increasing on amount", async function () {})
		it("Should emit approval event with right args", async function () {})
		it("Should revert if approval given for zero address", async function () {})
		it("Make tests for several increasings for different addresses in one unit test", async function () {})
	})
	describe("Decrease allowance", function () {
		it("Should update _allowances mapping by decreasing on amount", async function () {})
		it("Should emit approval event with right args", async function () {})
		it("Should revert if approval given for zero address", async function () {})
		it("Should revert if decreased allowance is below zero", async function () {})
		it("Make tests for several decreasings for different addresses in one unit test", async function () {})
	})
	describe("Transfer from", function () {
		it("Should update _allowances mapping by decreasing on amount", async function () {})
		it("Should increase balance of to address", async function () {})
		it("Should decrease balance of from address", async function () {})
		it("Should not change total supply", async function () {})
		it("Should emit transfer event", async function () {})
		it("Should revert if to is a zero address", async function () {})
		it("Should revert if from is a zero address", async function () {})
		it("Should revert if allowance is not enough", async function () {})
		it("Should revert if allowance is 0", async function () {})
		it("Should revert if not enough balance on from address", async function () {})
		it("Make tests for several transfers for different addresses in one unit test", async function () {})
	})
})
