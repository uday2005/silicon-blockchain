# 🔗 FundManager - Transparent Fund Management on Blockchain

> **Building Trust, Eliminating Corruption**  
> A Web3-based platform that brings
transparency and accountability to fund management
across organizations, governments, colleges, and NGOs using blockchain technology.
[Website](https://silicon-blockchain-nextjs.vercel.app/debug)

---

## 📋 Table of Contents

1. [Problem Statement](#problem-statement)

2. [Solution Overview](#solution-overview)

3. [Key Features](#key-features)

4. [Assumptions](#assumptions)

5. [Architecture](#architecture)

6. [Tech Stack](#tech-stack)

7. [Getting Started](#getting-started)

8. [Usage Flow](#usage-flow)

9. [Smart Contract Details](#smart-contract-details)

10. [Project Structure](#project-structure)

11. [Future Roadmap](#future-roadmap)

## Problem Statement

**The Real-World Problem:**

In many organizations—including
government departments, NGOs, universities, and municipal corporations—funds
allocated for specific projects are frequently misused or falsely reported.
This systemic issue includes:

- **Fake invoices and overbilling** - Vendors submit inflated or fabricated expenses1

- **Lack of transparency** - No way to verify if funds were actually spent as claimed

- **Centralized control** - A single authority decides
  fund allocation and vendor selection, enabling bias

- **Loss of public trust** - Donors and stakeholders can't verify
  their contributions were used ethically

- **Auditing challenges** - Manual, time-consuming,
and easily manipulated audit trails

**Real Example:**

> A local government allocates ₹10 lakh (1 million INR) to build school toilets.
Officials approve a ₹10 lakh payment to a vendor, but only ₹4 lakh worth of
actual work is completed. Fake invoices are submitted, and the remaining funds disappear.
No one can verify if the expense was legitimate.

---

## Solution Overview

**FundManager** is a decentralized fund management platform
built on Ethereum that creates an immutable, transparent,
and trustless system for managing funds.
Every transaction, approval, and proof is recorded on-chain and visible to stakeholders.

### Core Philosophy

- **Transparency**: Every transaction is public and traceable

- **Immutability**: Historical records cannot be tampered with

- **Decentralization**: Power shifts from single individuals to the community

- **Accountability**: All actions are timestamped and linked to addresses

- **Trust**: Vendors build reputation through verified work

---

## Key Features

### 1. **Organization Management**

- Organizations (government bodies, NGOs, colleges) can register on-chain

- Each organization has a dedicated wallet and fund pool

- Clear organizational hierarchy with head and stakeholders

### 2. **Transparent Donations**

- Anyone can donate ETH to any registered organization

- All donations are publicly recorded and traceable

- Donors can see exactly where their money goes

### 3. **Expense Tracking & Proof Management**

- Organization heads submit expenses with proof-of-work (stored on IPFS)

- Proof hashes are stored immutably on the blockchain

- Complete audit trail of every expense request

### 4. **Community-Based Vendor Selection**

- Vendors register on the platform and build reputation

- Community votes to approve vendors (prevents bias)

- Reputation scores visible for all transactions

### 5. **Decentralized Approval System**

- **Current**: Contract owner approves expenses

- **Future**: Community voting determines approval (DAO-based)

- Transparent voting records on-chain

### 6. **Vendor Reputation System**

- Vendors earn reputation through successful, verified projects
- Community members can upvote/downvote vendor work
- Reputation directly tied to wallet address (portable and verifiable)

### 7. **Real-time Analytics Dashboard**

- View organization fund flows: Allocated → Approved → Spent
- Track project completion status
- Public transparency score for each organization

---

## Assumptions

- Fiat on/off-ramping is handled off-platform.
  We assume compliant payment rails (exchanges, payment processors, or bank partners)
  are used to convert between fiat and crypto when needed;
  on-chain logic operates in ETH.
- Sybil resistance for voting is assumed.
  For vendor selection and future expense approvals,
  we assume an identity or anti-Sybil mechanism
  (e.g., proof-of-personhood, verified credentials, SBTs, or similar)
  ensures one-person-one-vote or fair weighting.
- IPFS availability is ensured via a pinning strategy.
  We treat IPFS CIDs as immutable references and
  assume a pinning provider maintains persistence.

---

## Architecture

### System Architecture Diagram

```ascii-diagram
┌─────────────────────────────────────────────────────────────────┐
│                       FundChain Platform                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   Frontend (Next.js) │◄───────►│  Smart Contracts     │
│  + React Components  │         │  (Solidity/Foundry)  │
│  + Wagmi Hooks       │         │                      │
│  + RainbowKit Wallet │         │  - FundManager       │
└──────────────────────┘         └──────────────────────┘
         ▲                                 ▲
         │                                 │
         │ IPFS Proofs                     │ Ethereum Network
         │ (Invoice/Images)                │ (Sepolia Testnet)
         ▼                                 ▼
┌──────────────────────┐         ┌──────────────────────┐
│   IPFS Storage       │         │  Blockchain Storage  │
│  (Distributed)       │         │  (Immutable)         │
│  - Receipts          │         │  - Transactions      │
│  - Photos            │         │  - Fund Records      │
│  - Documents         │         │  - Approvals         │
└──────────────────────┘         └──────────────────────┘
```

### User Flow Architecture

```ascii-diagram
┌─────────────────┐
│   Stakeholders  │
│  - Donors       │
│  - Auditors     │
│  - Citizens     │
└────────┬────────┘
         │
         ▼
    [View Dashboard]
         │
    ┌────┴────┐
    ▼         ▼
 [Track]   [Vote on]
 [Funds]   [Vendors]
    │         │
    └────┬────┘
         ▼
┌─────────────────────────────────────┐
│    Organization Head                │
│  1. Creates Organization            │
│  2. Allocates Funds/Projects        │
│  3. Selects Vendor (Community Vote) │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────┐
│   Vendor                 │
│  1. Register on Platform │
│  2. Do the Work          │
│  3. Upload Proof to IPFS │
│  4. Submit on Blockchain │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────────┐
│   Approval Process           │
│  1. Admin Reviews Proof      │
│  2. Community Votes (Future) │
│  3. Smart Contract Releases  │
│  4. Vendor Gets Paid         │
└──────────────────────────────┘
```

### Data Flow: Fund Allocation to Payment

```ascii-diagram
STEP 1: DONATION
┌──────────┐
│  Donor   │
└────┬─────┘
     │ Sends ETH
     ▼
┌────────────────────────────┐
│ Organization Smart Contract│
│ totalFunds += msg.value    │
└────────┬───────────────────┘
         │
         ▼ [Emit: DonationReceived]
      [Blockchain Record]

STEP 2: EXPENSE CREATION
┌─────────────────────┐
│ Organization Head   │
└────┬────────────────┘
     │ 1. Vendor does work
     │ 2. Creates expense
     ▼
┌──────────────────────────────────────┐
│ Organization Head Uploads to IPFS    │
│ - Invoice photos                      │
│ - Receipts                            │
│ - Work proof                          │
└────┬─────────────────────────────────┘
     │ Gets IPFS Hash (Qm...)
     ▼
┌─────────────────────────────────────────────┐
│ createExpense() on Smart Contract          │
│ - Description, Vendor Address, Amount      │
│ - ProofHash (IPFS Hash)                    │
│ - Status: PENDING                          │
└────────┬────────────────────────────────────┘
         │
         ▼ [Emit: ExpenseCreated]
      [Blockchain Record]

STEP 3: COMMUNITY VOTING (Future) / ADMIN APPROVAL (Current)
┌──────────────────┐
│ Community/Admin  │
└────┬─────────────┘
     │ 1. Reviews Proof on IPFS
     │ 2. Verifies legitimacy
     │ 3. Votes/Approves
     ▼
┌──────────────────────────────────┐
│ approveExpense() on Contract     │
│ - Checks totalFunds >= amount   │
│ - Transfers to Vendor Wallet    │
│ - Updates Status: APPROVED      │
└────────┬─────────────────────────┘
         │
         ▼ [Emit: ExpenseApproved]
      [Blockchain Record + Payment]

STEP 4: REPUTATION TRACKING
┌─────────────────────────────┐
│ Community Members           │
└────┬────────────────────────┘
     │ Upvote/Downvote Vendor
     ▼
┌──────────────────────────────┐
│ verifyProof() on Contract    │
│ - Increment/Decrement Score │
│ - Update Vendor Reputation  │
└────────┬─────────────────────┘
         │
         ▼ [Emit: ProofVerified]
    [Reputation Updated]
```

### Smart Contract Entities

```ascii-diagram
Organization
├── name (string)
├── details (string)
├── head (address)
├── totalFunds (uint256)
└── exists (bool)

Vendor
├── name (string)
├── details (string)
├── wallet (address)
├── reputation (uint256)
└── exists (bool)

Expense
├── description (string)
├── vendor (address)
├── amount (uint256)
├── proofHash (string) → IPFS Hash
├── status (Enum: Pending/Approved)
└── timestamp (implicit)

Trust Scores
├── proofTrustScores[orgId][expenseId]
├── hasVoted[user][orgId][expenseId]
└── vendorReputation[vendorAddress]
```

---

## Tech Stack

### Smart Contracts

- **Solidity** (^0.8.0) - Smart contract language
- **OpenZeppelin** - Battle-tested contract libraries
- **Foundry** - Ethereum development framework
- **Forge** - Smart contract testing and deployment

### Frontend

- **Next.js** (^15.x) - React framework for web apps
- **React** (^19.x) - UI library
- **TypeScript** - Type-safe JavaScript
- **Wagmi** (^2.x) - React hooks for Web3
- **RainbowKit** - Wallet connection UI
- **Tailwind CSS** + **DaisyUI** - Styling
- **Viem** (^2.x) - Ethereum client library

### Storage & Networking

- **IPFS** - Decentralized storage for proofs, invoices, images
- **Ethereum (Sepolia Testnet)** - Blockchain network
- **RPC Provider** - Network communication

### Development Tools

- **Git & GitHub** - Version control
- **Yarn** - Package manager
- **ESLint & Prettier** - Code quality

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** (>= v20.18.3) - [Download](https://nodejs.org/en/download/)
- **Yarn** (v3.x) - [Installation guide](https://yarnpkg.com/getting-started/install)
- **Git** - [Download](https://git-scm.com/downloads)
- **MetaMask or compatible wallet** - Browser extension for Ethereum interaction

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/uday2005/silicon-blockchain.git
cd silicon-blockchain
```

#### 2. Install Dependencies

```bash
yarn install
```

This installs dependencies for both the smart contracts (Foundry) and frontend (Next.js).

#### 3. Setup Environment Variables

Create a `.env.local` file in the `packages/nextjs` directory:

```bash
# packages/nextjs/.env.local
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
```

Create a `.env` file in the `packages/foundry` directory:

```bash
# packages/foundry/.env
DEPLOYER_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
SEPOLIA_RPC_URL=https://eth-sepolia.alchemyapi.io/v2/your_alchemy_key
```

#### 4. Run Local Blockchain (Terminal 1)

Start a local Ethereum network using Foundry:

```bash
yarn chain
```

This starts a local fork at `http://localhost:8545`.
You'll see logs showing the chain is running.
You now have access to test accounts with ETH for local testing.

#### 5. Deploy Smart Contracts (Terminal 2)

In a new terminal, deploy the FundManager contract to the local network:

```bash
yarn deploy
```

This will:

- Compile the Solidity contracts
- Deploy to the local chain
- Output contract addresses in `packages/foundry/deployments/31337.json`

#### 6. Start the Frontend (Terminal 3)

In a third terminal, start the Next.js development server:

```bash
cd packages/nextjs
yarn dev
```

Visit **http://localhost:3000** in your browser. You should see the FundManager dashboard.

#### 7. Connect Your Wallet

- Click **Connect Wallet** button
- Select **MetaMask** (or another wallet provider)
- For local testing, use Foundry's test accounts or
MetaMask's "Import Account" with private keys from `yarn chain` output

---

## Usage Flow

### For Organization Heads

1. **Register Organization**
   - Go to "Organizations" section
   - Click "Create Organization"
   - Provide name and details
   - Organization is now on-chain with you as head

2. **Manage Donors**
   - Share your organization ID or address
   - Donors will see your organization on the dashboard
   - Receive ETH donations transparently

3. **Allocate Work & Select Vendors**
   - Go to "Manage Expenses"
   - Create a new project/expense
   - Community votes on which vendor to hire
   - Vendor receives project details and timeline

4. **Verify & Submit Proof**
   - Once vendor completes work, they upload proof to IPFS (images, invoices, receipts)
   - Vendor submits the IPFS hash on-chain
   - You can now submit the expense request for approval

---

### For Donors

1. **Browse Organizations**
   - Visit the dashboard
   - See list of verified organizations
   - View total funds allocated and spent

2. **Donate to Cause**
   - Select an organization
   - Enter donation amount
   - Confirm transaction in wallet
   - Your donation is instantly recorded on-chain

3. **Track Your Impact**
   - View where your money went
   - See which vendors were paid
   - Access all proofs on IPFS
   - Follow project completion

4. **Vote on Vendors (Optional)**
   - Review completed work
   - Upvote/downvote based on quality
   - Help build vendor reputation

---

### For Vendors

1. **Register on Platform**
   - Go to "Vendor Registration"
   - Provide your name and portfolio
   - Register wallet address
   - You're now a verified vendor

2. **Get Selected by Community**
   - Organizations post project requests
   - Community votes on vendors
   - If selected, receive project details

3. **Complete Work**
   - Do the agreed-upon work (supply, build, service, etc.)
   - Take photos/receipts as proof
   - Upload all proof documents to IPFS
   - Get IPFS hash

4. **Submit Proof on Blockchain**
   - Go to "Submit Proof"
   - Enter IPFS hash
   - Smart contract records your work
   - Community members vote on quality

5. **Get Paid**
   - Admin approves the expense
   - Smart contract automatically transfers funds to your wallet
   - Reputation increases with positive feedback

---

### For Auditors/Admin

1. **Review Expense Proofs**
   - Go to "Admin Dashboard"
   - See pending expenses
   - Click proof hash to view on IPFS
   - Review photos, invoices, documents

2. **Approve or Reject**
   - If legitimate: Click "Approve"
   - Smart contract releases payment to vendor
   - Funds deducted from organization's pool
   - Transaction recorded immutably

3. **Monitor Platform**
   - View all transactions across organizations
   - Track vendor reputation trends
   - Identify suspicious patterns
   - Generate transparency reports

---

## Smart Contract Details

### FundManager.sol

**Location**: `packages/foundry/contracts/FundManager.sol`

#### Key Functions

##### Organization Management

```solidity
// Create a new organization
function createOrganization(string memory _name, string memory _details) public

// Get organization details
mapping(uint256 => Organization) public organizations
```

##### Donations

```solidity
// Donate ETH to an organization
function donate(uint256 _orgId) public payable

// Event emitted when donation received
event DonationReceived(uint256 indexed orgId, address indexed donor, uint256 amount)
```

##### Expense Management

```solidity
// Create a pending expense (org head only)
function createExpense(
    uint256 _orgId,
    string memory _description,
    address _vendor,
    uint256 _amount,
    string memory _proofHash
) public

// Approve and release payment (admin only - currently)
function approveExpense(uint256 _orgId, uint256 _expenseId) public

// Get all expenses for organization
function getExpenses(uint256 _orgId) public view returns (Expense[] memory)
```

##### Vendor Management

```solidity
// Register as a vendor
function registerVendor(string memory _name, string memory _details) public

// Get vendor reputation
mapping(address => Vendor) public vendors
```

##### Proof & Voting System

```solidity
// Submit proof (vendor or org head)
function submitProof(uint256 _orgId, uint256 _expenseId, string memory _proofHash) public

// Vote on proof (community upvote/downvote)
function verifyProof(uint256 _orgId, uint256 _expenseId, bool upvote) public

// Track votes per user
mapping(address => mapping(uint256 => mapping(uint256 => bool))) public hasVoted
```

#### Data Structures

##### **Organization**

- `name` - Organization name
- `details` - Description/purpose
- `head` - Address of organization leader
- `totalFunds` - Current balance
- `exists` - Whether organization is active

##### **Vendor**

- `name` - Vendor name
- `details` - Services/portfolio
- `wallet` - Ethereum address for payments
- `reputation` - Community trust score
- `exists` - Whether vendor is registered

##### **Expense**

- `description` - What the expense is for
- `vendor` - Vendor wallet address
- `amount` - Amount in ETH to be transferred
- `proofHash` - IPFS hash of proof documents
- `status` - Pending or Approved

---

## Project Structure

```
silicon-blockchain/
├── packages/
│   ├── foundry/                 # Smart Contracts & Deployment
│   │   ├── contracts/
│   │   │   ├── FundManager.sol          # Main contract
│   │   │   └── YourContract.sol         # Template
│   │   ├── script/
│   │   │   ├── Deploy.s.sol            # Deployment script
│   │   │   └── DeployHelpers.s.sol     # Helper functions
│   │   ├── test/
│   │   │   └── YourContract.t.sol      # Contract tests
│   │   ├── foundry.toml                # Foundry configuration
│   │   ├── remappings.txt              # Library remappings
│   │   └── package.json
│   │
│   └── nextjs/                  # Frontend Application
│       ├── app/
│       │   ├── page.tsx                # Home page
│       │   ├── layout.tsx              # Root layout
│       │   ├── blockexplorer/          # Transaction explorer
│       │   ├── debug/                  # Contract debugging
│       │   └── vendors/                # Vendor pages
│       ├── components/
│       │   ├── Header.tsx              # Navigation bar
│       │   ├── Footer.tsx              # Footer
│       │   └── scaffold-eth/           # Reusable web3 components
│       ├── contracts/
│       │   ├── deployedContracts.ts   # Deployed contract ABIs
│       │   └── externalContracts.ts   # External contract ABIs
│       ├── hooks/
│       │   └── scaffold-eth/          # Custom React hooks for web3
│       ├── services/
│       │   ├── web3/                  # Web3 utilities
│       │   └── store/                 # Zustand state management
│       ├── styles/
│       │   └── globals.css            # Global styles
│       ├── utils/
│       │   └── scaffold-eth/          # Utility functions
│       ├── types/
│       │   └── abitype/               # TypeScript type definitions
│       ├── public/
│       │   └── manifest.json          # PWA manifest
│       ├── next.config.ts             # Next.js configuration
│       ├── tsconfig.json              # TypeScript config
│       ├── tailwind.config.js         # Tailwind CSS config
│       └── package.json
│
├── README.md                    # This file
├── LICENCE                      # License information
├── CONTRIBUTING.md             # Contribution guidelines
└── package.json               # Root package.json
```

---

## Future Roadmap

- Community approval of expenses (DAO-based), replacing owner-only approvals.
- Sybil-resistant voting for vendor selection and
  expense approvals using on-chain identity or verifiable credentials.
- Treasury controlled by a community multisig as an interim step,
  migrating to full on-chain governance with timelocks for critical changes.
- Replace single-admin roles with governance-controlled parameters
  (quorum, thresholds, roles) managed on-chain.

---

## Acknowledgments

- Built with [Scaffold-ETH 2](https://scaffoldeth.io/)
- Smart contract libraries from [OpenZeppelin](https://openzeppelin.com/)
- Testing framework: [Foundry](https://github.com/foundry-rs/foundry)
- Styling: [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)

---
