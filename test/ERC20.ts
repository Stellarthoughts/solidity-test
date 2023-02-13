import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

describe("ERC20", function () {
	// Default fixture
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

	// Account 1-3 get amountMint tokens each
	async function deployContractTokensMintedFixture() {
		const [owner, otherAccount1, otherAccount2, otherAccount3] = await ethers.getSigners()
		const TestERC20 = await ethers.getContractFactory("ERC20")

		const name = "Test"
		const symbol = "TST"
		const price = ethers.utils.parseEther("0.1")
		const testERC20 = await TestERC20.deploy(name, symbol, price)

		const amountMint = 10

		await testERC20.connect(otherAccount1).mint(amountMint, { value: price.mul(amountMint) })
		await testERC20.connect(otherAccount2).mint(amountMint, { value: price.mul(amountMint) })
		await testERC20.connect(otherAccount3).mint(amountMint, { value: price.mul(amountMint) })

		return {
			owner,
			otherAccount1,
			otherAccount2,
			otherAccount3,
			name,
			symbol,
			price,
			testERC20,
			amountMint,
		}
	}

	// Account 1-3 get amountMint tokens each
	// Account 1 approved Account 2 amountApprove1 tokens
	// Account 2 approved Account 3 amountApprove2 tokens
	// Account 3 approved Account 1 amountApprove3 tokens
	async function deployContractTokensApprovedFixture() {
		const [owner, otherAccount1, otherAccount2, otherAccount3] = await ethers.getSigners()
		const TestERC20 = await ethers.getContractFactory("ERC20")

		const name = "Test"
		const symbol = "TST"
		const price = ethers.utils.parseEther("0.1")
		const testERC20 = await TestERC20.deploy(name, symbol, price)

		const amountMint = 10

		await testERC20.connect(otherAccount1).mint(amountMint, { value: price.mul(amountMint) })
		await testERC20.connect(otherAccount2).mint(amountMint, { value: price.mul(amountMint) })
		await testERC20.connect(otherAccount3).mint(amountMint, { value: price.mul(amountMint) })

		const amountApprove1 = 4
		const amountApprove2 = 6
		const amountApprove3 = 9

		await testERC20.connect(otherAccount1).approve(otherAccount2.address, amountApprove1)
		await testERC20.connect(otherAccount2).approve(otherAccount3.address, amountApprove2)
		await testERC20.connect(otherAccount3).approve(otherAccount1.address, amountApprove3)

		return {
			owner,
			otherAccount1,
			otherAccount2,
			otherAccount3,
			name,
			symbol,
			price,
			testERC20,
			amountMint,
			amountApprove1,
			amountApprove2,
			amountApprove3,
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
			).to.be.revertedWith("ERC20: Not enough ethers to mint")
		})
		it("Make tests for several mints for different addresses in one unit test", async function () {
			const { testERC20, otherAccount1, otherAccount2, otherAccount3, price } =
				await loadFixture(deployContractFixture)
			const amount1 = 10
			const amount2 = 20
			const amount3 = 30
			const beforeSupply = await testERC20.totalSupply()
			await testERC20.connect(otherAccount1).mint(amount1, { value: price.mul(amount1) })
			await testERC20.connect(otherAccount2).mint(amount2, { value: price.mul(amount2) })
			await testERC20.connect(otherAccount3).mint(amount3, { value: price.mul(amount3) })
			expect(await testERC20.totalSupply()).to.equal(
				beforeSupply.add(amount1 + amount2 + amount3)
			)
			expect(await testERC20.balanceOf(otherAccount1.address)).to.equal(amount1)
			expect(await testERC20.balanceOf(otherAccount2.address)).to.equal(amount2)
			expect(await testERC20.balanceOf(otherAccount3.address)).to.equal(amount3)
		})
	})
	describe("Transfer", function () {
		it("Should increase balance of to address", async function () {
			const { testERC20, otherAccount1, otherAccount2, amountMint } = await loadFixture(
				deployContractTokensMintedFixture
			)
			const amountTransfer = amountMint - 1
			await expect(
				testERC20.connect(otherAccount1).transfer(otherAccount2.address, amountTransfer)
			).to.changeTokenBalance(testERC20, otherAccount2, amountTransfer)
		})
		it("Should decrease balance of caller", async function () {
			const { testERC20, otherAccount1, otherAccount2, amountMint } = await loadFixture(
				deployContractTokensMintedFixture
			)
			const amountTransfer = amountMint - 1
			await expect(
				testERC20.connect(otherAccount1).transfer(otherAccount2.address, amountTransfer)
			).to.changeTokenBalance(testERC20, otherAccount1, -amountTransfer)
		})
		it("Should not change total supply", async function () {
			const { testERC20, otherAccount1, otherAccount2, amountMint } = await loadFixture(
				deployContractTokensMintedFixture
			)
			const amountTransfer = amountMint - 1
			const beforeSupply = await testERC20.totalSupply()
			await testERC20.connect(otherAccount1).transfer(otherAccount2.address, amountTransfer)
			expect(await testERC20.totalSupply()).to.equal(beforeSupply)
		})
		it("Should emit transfer event with right args", async function () {
			const { testERC20, otherAccount1, otherAccount2, amountMint } = await loadFixture(
				deployContractTokensMintedFixture
			)
			const amountTransfer = amountMint - 1
			await expect(
				testERC20.connect(otherAccount1).transfer(otherAccount2.address, amountTransfer)
			)
				.to.emit(testERC20, "Transfer")
				.withArgs(otherAccount1.address, otherAccount2.address, amountTransfer)
		})
		it("Should revert if to is a zero address", async function () {
			const { testERC20, otherAccount1, amountMint } = await loadFixture(
				deployContractTokensMintedFixture
			)
			const amountTransfer = amountMint - 1
			await expect(
				testERC20
					.connect(otherAccount1)
					.transfer(ethers.constants.AddressZero, amountTransfer)
			).to.be.revertedWith("ERC20: transfer to the zero address")
		})
		it("Should revert if caller balance is less than amount to transfer", async function () {
			const { testERC20, otherAccount1, otherAccount2, amountMint } = await loadFixture(
				deployContractTokensMintedFixture
			)
			const amountTransfer = amountMint + 1
			await expect(
				testERC20.connect(otherAccount1).transfer(otherAccount2.address, amountTransfer)
			).to.be.revertedWith("ERC20: transfer amount exceeds balance")
		})
		it("Make tests for several transfers for different addresses in one unit test", async function () {
			const { testERC20, otherAccount1, otherAccount2, otherAccount3, amountMint } =
				await loadFixture(deployContractTokensMintedFixture)
			const amountTransfer1 = 5
			const amountTransfer2 = 3
			const amountTransfer3 = 9

			/*
				account1 -> amountTransfer1 -> account2
				account2 -> amountTransfer2 -> account3
				account3 -> amountTransfer3 -> account1
				account1: amountMint - amountTransfer1 + amountTransfer3
				account2: amountMint + amountTransfer1 - amountTransfer2
				account3: amountMint + amountTransfer2 - amountTransfer3
			*/
			const amountAfter1 = amountMint - amountTransfer1 + amountTransfer3
			const amountAfter2 = amountMint + amountTransfer1 - amountTransfer2
			const amountAfter3 = amountMint + amountTransfer2 - amountTransfer3

			const supplyBefore = await testERC20.totalSupply()
			await testERC20.connect(otherAccount1).transfer(otherAccount2.address, amountTransfer1)
			await testERC20.connect(otherAccount2).transfer(otherAccount3.address, amountTransfer2)
			await testERC20.connect(otherAccount3).transfer(otherAccount1.address, amountTransfer3)
			expect(await testERC20.totalSupply()).to.equal(supplyBefore)
			expect(await testERC20.balanceOf(otherAccount1.address)).to.equal(amountAfter1)
			expect(await testERC20.balanceOf(otherAccount2.address)).to.equal(amountAfter2)
			expect(await testERC20.balanceOf(otherAccount3.address)).to.equal(amountAfter3)
		})
	})
	describe("Burn", function () {
		it("Should decrease balance of caller", async function () {
			const { testERC20, otherAccount1, amountMint } = await loadFixture(
				deployContractTokensMintedFixture
			)
			const amountBurn = amountMint - 1
			await expect(testERC20.connect(otherAccount1).burn(amountBurn)).to.changeTokenBalance(
				testERC20,
				otherAccount1,
				-amountBurn
			)
		})
		it("Should decrease total supply", async function () {
			const { testERC20, otherAccount1, amountMint } = await loadFixture(
				deployContractTokensMintedFixture
			)
			const amountBurn = amountMint - 1
			const supplyBefore = await testERC20.totalSupply()
			await testERC20.connect(otherAccount1).burn(amountBurn)
			expect(await testERC20.totalSupply()).to.equal(supplyBefore.sub(amountBurn))
		})
		it("Should emit transfer event with right args", async function () {
			const { testERC20, otherAccount1, amountMint } = await loadFixture(
				deployContractTokensMintedFixture
			)
			const amountBurn = amountMint - 1
			await expect(testERC20.connect(otherAccount1).burn(amountBurn))
				.to.emit(testERC20, "Transfer")
				.withArgs(otherAccount1.address, ethers.constants.AddressZero, amountBurn)
		})
		it("Should revert if caller balance is less than amount to burn", async function () {
			const { testERC20, otherAccount1, amountMint } = await loadFixture(
				deployContractTokensMintedFixture
			)
			const amountBurn = amountMint + 1
			await expect(testERC20.connect(otherAccount1).burn(amountBurn)).to.be.revertedWith(
				"ERC20: burn amount exceeds balance"
			)
		})
		it("Make tests for several burns for different addresses in one unit test", async function () {
			const { testERC20, otherAccount1, otherAccount2, otherAccount3, price } =
				await loadFixture(deployContractTokensMintedFixture)
			const amountBurn1 = 4
			const amountBurn2 = 6
			const amountBurn3 = 9

			const supplyBefore = await testERC20.totalSupply()

			await expect(testERC20.connect(otherAccount1).burn(amountBurn1)).to.changeTokenBalance(
				testERC20,
				otherAccount1,
				-amountBurn1
			)
			await expect(testERC20.connect(otherAccount2).burn(amountBurn2)).to.changeTokenBalance(
				testERC20,
				otherAccount2,
				-amountBurn2
			)
			await expect(testERC20.connect(otherAccount3).burn(amountBurn3)).to.changeTokenBalance(
				testERC20,
				otherAccount3,
				-amountBurn3
			)
			expect(await testERC20.totalSupply()).to.equal(
				supplyBefore.sub(amountBurn1 + amountBurn2 + amountBurn3)
			)
		})
	})
	describe("Approve", function () {
		it("Should update _allowances mapping by setting amount", async function () {
			const { testERC20, otherAccount1, otherAccount2 } = await loadFixture(
				deployContractTokensMintedFixture
			)
			const amountApprove = 4
			await testERC20.connect(otherAccount1).approve(otherAccount2.address, amountApprove)
			expect(
				await testERC20.allowance(otherAccount1.address, otherAccount2.address)
			).to.equal(amountApprove)
		})
		it("Should emit approval event with right args", async function () {
			const { testERC20, otherAccount1, otherAccount2 } = await loadFixture(
				deployContractTokensMintedFixture
			)
			const amountApprove = 4
			await expect(
				testERC20.connect(otherAccount1).approve(otherAccount2.address, amountApprove)
			)
				.to.emit(testERC20, "Approval")
				.withArgs(otherAccount1.address, otherAccount2.address, amountApprove)
		})
		it("Should revert if approval given for zero address", async function () {
			const { testERC20, otherAccount1 } = await loadFixture(
				deployContractTokensMintedFixture
			)
			const amountApprove = 4
			await expect(
				testERC20
					.connect(otherAccount1)
					.approve(ethers.constants.AddressZero, amountApprove)
			).to.be.revertedWith("ERC20: approve to the zero address")
		})
		it("Make tests for several approvals for different addresses in one unit test", async function () {
			const { testERC20, otherAccount1, otherAccount2, otherAccount3 } = await loadFixture(
				deployContractTokensMintedFixture
			)
			const amountApprove1 = 4
			const amountApprove2 = 3
			const amountApprove3 = 9
			/*
				otherAccount1 -> amountApprove1 -> otherAccount2
				otherAccount2 -> amountApprove2 -> otherAccount3
				otherAccount3 -> amountApprove3 -> otherAccount1
			*/
			await testERC20.connect(otherAccount1).approve(otherAccount2.address, amountApprove1)
			await testERC20.connect(otherAccount2).approve(otherAccount3.address, amountApprove2)
			await testERC20.connect(otherAccount3).approve(otherAccount1.address, amountApprove3)
			expect(
				await testERC20.allowance(otherAccount1.address, otherAccount2.address)
			).to.equal(amountApprove1)
			expect(
				await testERC20.allowance(otherAccount2.address, otherAccount3.address)
			).to.equal(amountApprove2)
			expect(
				await testERC20.allowance(otherAccount3.address, otherAccount1.address)
			).to.equal(amountApprove3)
		})
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
