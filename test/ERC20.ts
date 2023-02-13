import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { formatEther } from "ethers/lib/utils"
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

		const accounts = [otherAccount1, otherAccount2, otherAccount3]

		return {
			owner,
			otherAccount1,
			otherAccount2,
			otherAccount3,
			accounts,
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
		const accounts = [otherAccount1, otherAccount2, otherAccount3]
		for (let i = 0; i < accounts.length; i++) {
			await testERC20.connect(accounts[i]).mint(amountMint, { value: price.mul(amountMint) })
		}

		return {
			owner,
			otherAccount1,
			otherAccount2,
			otherAccount3,
			accounts,
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
		const accounts = [otherAccount1, otherAccount2, otherAccount3]
		for (let i = 0; i < accounts.length; i++) {
			await testERC20.connect(accounts[i]).mint(amountMint, { value: price.mul(amountMint) })
		}

		const amountApprove1 = 4
		const amountApprove2 = 6
		const amountApprove3 = 9
		const approvals = [amountApprove1, amountApprove2, amountApprove3]

		for (let i = 0; i < accounts.length; i++) {
			const accontSpender = accounts[(i + 1) % accounts.length]
			await testERC20.connect(accounts[i]).approve(accontSpender.address, approvals[i])
		}

		return {
			owner,
			otherAccount1,
			otherAccount2,
			otherAccount3,
			accounts,
			approvals,
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
			const amountMint = 10
			await expect(
				testERC20.connect(otherAccount1).mint(amountMint, { value: price.mul(amountMint) })
			).to.changeTokenBalance(testERC20, otherAccount1, amountMint)
		})
		it("Should increase total supply", async function () {
			const { testERC20, otherAccount1, price } = await loadFixture(deployContractFixture)
			const amountMint = 10
			await testERC20
				.connect(otherAccount1)
				.mint(amountMint, { value: price.mul(amountMint) })
			expect(await testERC20.totalSupply()).to.equal(amountMint)
		})
		it("Should emit transfer event with right args", async function () {
			const { testERC20, otherAccount1, price } = await loadFixture(deployContractFixture)
			const amountMint = 10
			await expect(
				testERC20.connect(otherAccount1).mint(amountMint, { value: price.mul(amountMint) })
			)
				.to.emit(testERC20, "Transfer")
				.withArgs(ethers.constants.AddressZero, otherAccount1.address, amountMint)
		})
		it("Should increase contract ethers balance", async function () {
			const { testERC20, otherAccount1, price } = await loadFixture(deployContractFixture)
			const amountMint = 10
			await expect(
				testERC20.connect(otherAccount1).mint(amountMint, { value: price.mul(amountMint) })
			).to.changeEtherBalance(testERC20, price.mul(amountMint))
		})
		it("Should decrease caller ethers balance", async function () {
			const { testERC20, otherAccount1, price } = await loadFixture(deployContractFixture)
			const amountMint = 10
			await expect(
				testERC20.connect(otherAccount1).mint(amountMint, { value: price.mul(amountMint) })
			).to.changeEtherBalance(otherAccount1, price.mul(amountMint).mul(-1))
		})
		it("Should revert if message value is less than price * token amount", async function () {
			const { testERC20, otherAccount1, price } = await loadFixture(deployContractFixture)
			const amountMint = 10
			await expect(
				testERC20
					.connect(otherAccount1)
					.mint(amountMint, { value: price.mul(amountMint).sub(1) })
			).to.be.revertedWith("ERC20: Not enough ethers to mint")
		})
		it("Make tests for several mints for different addresses in one unit test", async function () {
			const { testERC20, accounts, price } = await loadFixture(deployContractFixture)
			const amountsMint = [10, 20, 30]
			const beforeSupply = await testERC20.totalSupply()

			for (let i = 0; i < accounts.length; i++) {
				await testERC20
					.connect(accounts[i])
					.mint(amountsMint[i], { value: price.mul(amountsMint[i]) })
			}

			const totalMint = amountsMint.reduce((sum, current) => sum + current, 0)
			expect(await testERC20.totalSupply()).to.equal(beforeSupply.add(totalMint))

			for (let i = 0; i < accounts.length; i++) {
				expect(await testERC20.balanceOf(accounts[i].address)).to.equal(amountsMint[i])
			}
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
			const { testERC20, accounts, amountMint } = await loadFixture(
				deployContractTokensMintedFixture
			)
			const amountTransfer1 = 5
			const amountTransfer2 = 3
			const amountTransfer3 = 9

			const amountsTransfer = [5, 3, 9]

			/*
				account1 -> amountTransfer1 -> account2
				account2 -> amountTransfer2 -> account3
				account3 -> amountTransfer3 -> account1
				account1: amountMint - amountTransfer1 + amountTransfer3
				account2: amountMint + amountTransfer1 - amountTransfer2
				account3: amountMint + amountTransfer2 - amountTransfer3
			*/

			const amountsAfter = [
				amountMint - amountTransfer1 + amountTransfer3,
				amountMint + amountTransfer1 - amountTransfer2,
				amountMint + amountTransfer2 - amountTransfer3,
			]

			const supplyBefore = await testERC20.totalSupply()

			for (let i = 0; i < accounts.length; i++) {
				const transferTo = accounts[(i + 1) % accounts.length]
				await testERC20
					.connect(accounts[i])
					.transfer(transferTo.address, amountsTransfer[i])
			}
			expect(await testERC20.totalSupply()).to.equal(supplyBefore)

			for (let i = 0; i < accounts.length; i++) {
				expect(await testERC20.balanceOf(accounts[i].address)).to.equal(amountsAfter[i])
			}
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
			const { testERC20, accounts } = await loadFixture(deployContractTokensMintedFixture)
			const amountsBurn = [4, 6, 9]

			const supplyBefore = await testERC20.totalSupply()

			for (let i = 0; i < accounts.length; i++) {
				await expect(
					testERC20.connect(accounts[i]).burn(amountsBurn[i])
				).to.changeTokenBalance(testERC20, accounts[i], -amountsBurn[i])
			}

			const totalBurn = amountsBurn.reduce((sum, current) => sum + current, 0)
			expect(await testERC20.totalSupply()).to.equal(supplyBefore.sub(totalBurn))
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
			const { testERC20, accounts } = await loadFixture(deployContractTokensMintedFixture)
			const amountsApprove = [4, 3, 9]
			/*
				otherAccount1 -> amountApprove1 -> otherAccount2
				otherAccount2 -> amountApprove2 -> otherAccount3
				otherAccount3 -> amountApprove3 -> otherAccount1
			*/
			for (let i = 0; i < accounts.length; i++) {
				const toApprove = accounts[(i + 1) % accounts.length]
				await testERC20.connect(accounts[i]).approve(toApprove.address, amountsApprove[i])
			}

			for (let i = 0; i < accounts.length; i++) {
				expect(
					await testERC20.allowance(
						accounts[i].address,
						accounts[(i + 1) % accounts.length].address
					)
				).to.equal(amountsApprove[i])
			}
		})
	})
	describe("Increase allowance", function () {
		it("Should update _allowances mapping by increasing on amount", async function () {
			const { testERC20, otherAccount1, otherAccount2, amountApprove1 } = await loadFixture(
				deployContractTokensApprovedFixture
			)
			const amountIncrease = 5
			await testERC20
				.connect(otherAccount1)
				.increaseAllowance(otherAccount2.address, amountIncrease)
			expect(
				await testERC20.allowance(otherAccount1.address, otherAccount2.address)
			).to.equal(amountApprove1 + amountIncrease)
		})
		it("Should emit approval event with right args", async function () {
			const { testERC20, otherAccount1, otherAccount2, amountApprove1 } = await loadFixture(
				deployContractTokensApprovedFixture
			)
			const amountIncrease = 5
			await expect(
				testERC20
					.connect(otherAccount1)
					.increaseAllowance(otherAccount2.address, amountIncrease)
			)
				.to.emit(testERC20, "Approval")
				.withArgs(
					otherAccount1.address,
					otherAccount2.address,
					amountApprove1 + amountIncrease
				)
		})
		it("Should revert if approval given for zero address", async function () {
			const { testERC20, otherAccount1 } = await loadFixture(
				deployContractTokensApprovedFixture
			)
			const amountIncrease = 5
			await expect(
				testERC20
					.connect(otherAccount1)
					.increaseAllowance(ethers.constants.AddressZero, amountIncrease)
			).to.be.revertedWith("ERC20: approve to the zero address")
		})
		it("Make tests for several increasings for different addresses in one unit test", async function () {
			const { testERC20, accounts, approvals } = await loadFixture(
				deployContractTokensApprovedFixture
			)

			const amountsIncrease = [3, 5, 6]

			for (let i = 0; i < accounts.length; i++) {
				const approveTo = accounts[(i + 1) % accounts.length]
				await testERC20
					.connect(accounts[i])
					.increaseAllowance(approveTo.address, amountsIncrease[i])
				expect(await testERC20.allowance(accounts[i].address, approveTo.address)).to.equal(
					approvals[i] + amountsIncrease[i]
				)
			}
		})
	})
	describe("Decrease allowance", function () {
		it("Should update _allowances mapping by decreasing on amount", async function () {
			const { testERC20, otherAccount1, otherAccount2, amountApprove1 } = await loadFixture(
				deployContractTokensApprovedFixture
			)
			const amountDecrease = amountApprove1 - 1
			await testERC20
				.connect(otherAccount1)
				.decreaseAllowance(otherAccount2.address, amountDecrease)
			expect(
				await testERC20.allowance(otherAccount1.address, otherAccount2.address)
			).to.equal(amountApprove1 - amountDecrease)
		})
		it("Should emit approval event with right args", async function () {
			const { testERC20, otherAccount1, otherAccount2, amountApprove1 } = await loadFixture(
				deployContractTokensApprovedFixture
			)
			const amountDecrease = amountApprove1 - 1
			await expect(
				testERC20
					.connect(otherAccount1)
					.decreaseAllowance(otherAccount2.address, amountDecrease)
			)
				.to.emit(testERC20, "Approval")
				.withArgs(
					otherAccount1.address,
					otherAccount2.address,
					amountApprove1 - amountDecrease
				)
		})
		it("Should revert if approval given for zero address", async function () {
			const { testERC20, otherAccount1 } = await loadFixture(
				deployContractTokensMintedFixture
			)
			const amountDecrease = 0
			await expect(
				testERC20
					.connect(otherAccount1)
					.decreaseAllowance(ethers.constants.AddressZero, amountDecrease)
			).to.be.revertedWith("ERC20: approve to the zero address")
		})
		it("Should revert if decreased allowance is below zero", async function () {
			const { testERC20, otherAccount1, otherAccount2, amountApprove1 } = await loadFixture(
				deployContractTokensApprovedFixture
			)
			const amountDecrease = amountApprove1 + 1
			await expect(
				testERC20
					.connect(otherAccount1)
					.decreaseAllowance(otherAccount2.address, amountDecrease)
			).to.be.revertedWith("ERC20: decreased allowance below zero")
		})
		it("Make tests for several decreasings for different addresses in one unit test", async function () {
			const { testERC20, accounts, approvals } = await loadFixture(
				deployContractTokensApprovedFixture
			)

			for (let i = 0; i < accounts.length; i++) {
				const approveTo = accounts[(i + 1) % accounts.length]
				await testERC20
					.connect(accounts[i])
					.decreaseAllowance(approveTo.address, approvals[i] - 1)
				expect(await testERC20.allowance(accounts[i].address, approveTo.address)).to.equal(
					1
				)
			}
		})
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
