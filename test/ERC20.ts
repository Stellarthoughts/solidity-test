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

		return {
			owner,
			otherAccount1,
			otherAccount2,
			otherAccount3,
			name,
			symbol,
			price,
			testERC20,
		}
	}
	describe("Deployment", function () {
		it("Should deploy with proper address", async function () {
			const { testERC20 } = await loadFixture(deployContractFixture)
			expect(ethers.utils.isAddress(testERC20.address)).to.be.true
		})
		it("Should deploy with right name", async function () {
			const { testERC20, name } = await loadFixture(deployContractFixture)
			expect(await testERC20.name()).to.equal(name)
		})
		it("Should deploy with right symbol", async function () {
			const { testERC20, symbol } = await loadFixture(deployContractFixture)
			expect(await testERC20.symbol()).to.equal(symbol)
		})
		it("Should deploy with right price", async function () {
			const { testERC20, price } = await loadFixture(deployContractFixture)
			expect(await testERC20.price()).to.equal(price)
		})
		it("Should be 0 total supply after deploy", async function () {
			const { testERC20 } = await loadFixture(deployContractFixture)
			expect(await testERC20.totalSupply()).to.equal(0)
		})
	})
	describe("Mint", function () {
		it("Should increase balance of caller on given amount", async function () {
			const { testERC20, otherAccount1, price } = await loadFixture(deployContractFixture)
			const amount = 10
			await expect(
				testERC20.connect(otherAccount1).mint(amount, { value: price.mul(amount) })
			).to.changeTokenBalance(testERC20, otherAccount1, amount)
		})
		it("Should increase total supply", async function () {
			const { testERC20, otherAccount1, price } = await loadFixture(deployContractFixture)
			const amount = 10
			await testERC20.connect(otherAccount1).mint(amount, { value: price.mul(amount) })
			expect(await testERC20.totalSupply()).to.equal(amount)
		})
		it("Should emit transfer event with right args", async function () {
			const { testERC20, otherAccount1, price } = await loadFixture(deployContractFixture)
			const amount = 10
			await expect(
				testERC20.connect(otherAccount1).mint(amount, { value: price.mul(amount) })
			)
				.to.emit(testERC20, "Transfer")
				.withArgs(ethers.constants.AddressZero, otherAccount1.address, amount)
		})
		it("Should increase contract ethers balance", async function () {
			const { testERC20, otherAccount1, price } = await loadFixture(deployContractFixture)
			const amount = 10
			await expect(
				testERC20.connect(otherAccount1).mint(amount, { value: price.mul(amount) })
			).to.changeEtherBalance(testERC20, price.mul(amount))
		})
		it("Should decrease caller ethers balance", async function () {
			const { testERC20, otherAccount1, price } = await loadFixture(deployContractFixture)
			const amount = 10
			await expect(
				testERC20.connect(otherAccount1).mint(amount, { value: price.mul(amount) })
			).to.changeEtherBalance(otherAccount1, price.mul(amount).mul(-1))
		})
		it("Should revert if message value is less than price * token amount", async function () {
			const { testERC20, otherAccount1, price } = await loadFixture(deployContractFixture)
			const amount = 10
			await expect(
				testERC20.connect(otherAccount1).mint(amount, { value: price.mul(amount).sub(1) })
			).to.be.reverted
		})
		it("Make tests for several mints for different addresses in one unit test", async function () {
			const { testERC20, otherAccount1, otherAccount2, otherAccount3, price } = await loadFixture(
				deployContractFixture
			)
			const amount1 = 10
			const amount2 = 20
			const amount3 = 30
			await testERC20.connect(otherAccount1).mint(amount1, { value: price.mul(amount1) })
			await testERC20.connect(otherAccount2).mint(amount2, { value: price.mul(amount2) })
			await testERC20.connect(otherAccount3).mint(amount3, { value: price.mul(amount3) })
			expect(await testERC20.totalSupply()).to.equal(amount1 + amount2 + amount3)
			expect(await testERC20.balanceOf(otherAccount1.address)).to.equal(amount1)
			expect(await testERC20.balanceOf(otherAccount2.address)).to.equal(amount2)
			expect(await testERC20.balanceOf(otherAccount3.address)).to.equal(amount3)
		})
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
