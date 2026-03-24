# VoteChain — Decentralized Voting System

A production-grade, full-stack decentralized voting DApp built with React, Node.js, MySQL, and Ethereum blockchain.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) + TailwindCSS + Recharts |
| Backend | Node.js + Express + JWT |
| Database | MySQL |
| Blockchain | Ethereum + Solidity + Hardhat |
| Wallet | MetaMask + Ethers.js v6 |

---

## Project Structure

```
decentralized-voting-system/
├── client/          # React frontend (Vite)
├── server/          # Node.js/Express backend
├── blockchain/      # Hardhat + Solidity smart contracts
└── database/        # MySQL schema
```

---

## Prerequisites

- Node.js >= 18
- MySQL >= 8.0
- MetaMask browser extension
- Git

---

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repo>
cd decentralized-voting-system

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..

# Install blockchain dependencies
cd blockchain && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example server/.env
# Edit server/.env with your MySQL credentials and secrets
```

### 3. Setup Database

```bash
mysql -u root -p < database/schema.sql
```

### 4. Start Blockchain (Local)

```bash
cd blockchain

# Start local Hardhat node
npx hardhat node

# In a new terminal, deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

The deploy script automatically saves the contract address and ABI to:
- `client/src/contracts/Voting.json`
- `server/config/contract.json`

### 5. Start Backend

```bash
cd server
cp .env.example .env   # Edit with your values
npm run dev
# Server runs on http://localhost:5000
```

### 6. Start Frontend

```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

---

## Default Admin Account

```
Email:    admin@votingsystem.com
Password: Admin@123
```

> ⚠️ Change this password in production!

---

## Usage Flow

### Admin Flow
1. Log in as admin
2. Create an election (triggers blockchain transaction)
3. Add candidates to the election
4. Start the election when ready
5. Users can now vote
6. End the election when voting is complete
7. View results with charts

### User Flow
1. Register / log in
2. Connect MetaMask wallet
3. Browse active elections
4. Select a candidate and cast vote (MetaMask confirmation)
5. Vote is recorded on Ethereum blockchain
6. View results and transaction hash

---

## API Reference

### Auth
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login
GET  /api/auth/profile     - Get current user
PUT  /api/auth/wallet      - Update wallet address
```

### Elections
```
GET  /api/elections           - List all elections
GET  /api/elections/:id       - Get single election
POST /api/elections           - Create election (admin)
POST /api/elections/start/:id - Start election (admin)
POST /api/elections/end/:id   - End election (admin)
```

### Candidates
```
GET  /api/candidates/:electionId  - List candidates
POST /api/candidates              - Add candidate (admin)
```

### Voting
```
POST /api/vote                    - Record vote metadata
GET  /api/vote/status/:electionId - Check if user voted
```

### Results
```
GET /api/results/:electionId            - Get results (DB)
GET /api/results/:electionId/blockchain - Get results (blockchain)
```

### Blockchain
```
GET /api/blockchain/transactions  - List all transactions
GET /api/blockchain/verify/:hash  - Verify transaction
GET /api/blockchain/contract      - Get contract info
```

---

## Smart Contract

Located at `blockchain/contracts/Voting.sol`

Key functions:
- `createElection(title, description)` - Admin only
- `addCandidate(electionId, name, description)` - Admin only
- `startElection(electionId)` - Admin only
- `endElection(electionId)` - Admin only
- `vote(electionId, candidateId)` - Any wallet, once per election
- `getResults(electionId)` - Public read

---

## Deploying to Sepolia Testnet

1. Get Sepolia ETH from a faucet
2. Add your private key to `server/.env`:
   ```
   ADMIN_PRIVATE_KEY=0x...
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   ```
3. Deploy:
   ```bash
   cd blockchain
   npx hardhat run scripts/deploy.js --network sepolia
   ```

---

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication with expiry
- ✅ Rate limiting on all API routes
- ✅ Helmet.js security headers
- ✅ Smart contract prevents double voting
- ✅ Input validation with express-validator
- ✅ SQL injection prevention (parameterized queries)
- ✅ Transaction hash verification

---

## License

MIT
