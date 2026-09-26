# ARBCheck — Multi-Chain Token & Smart Contract Risk Scanner

> **"Check any token contract before you touch it."**
> Analisa risiko on-chain yang 100% read-only untuk token ERC-20 di **Arbitrum Sepolia, Arbitrum One, Ethereum Mainnet, dan Ethereum Sepolia.**

![Stack](https://img.shields.io/badge/Frontend-React_19+Vite-blue)
![Chain](https://img.shields.io/badge/Chains-Arbitrum_%2B_Ethereum-28A0F0)
![Ethers](https://img.shields.io/badge/Onchain-ethers.js_v6-3C3C3D)
![License](https://img.shields.io/badge/License-MVP_Educational-orange)

---

## Daftar Isi

- [Kenapa ARBCheck?](#kenapa-arbcheck)
- [Fitur Utama](#fitur-utama)
- [Demo Token per Network](#demo-token-per-network)
- [Tech Stack](#tech-stack)
- [Struktur Project](#struktur-project)
- [Quickstart](#quickstart)
- [Environment Variable (.env)](#environment-variable-env)
- [Smart Contract Test Token](#smart-contract-test-token)
- [Cara Kerja Scanner](#cara-kerja-scanner)
- [Risk Scoring Engine](#risk-scoring-engine)
- [API Explorer](#api-explorer)
- [Script Compile & Deploy](#script-compile--deploy)
- [Struktur `src/` Frontend](#struktur-src-frontend)
- [Error State](#error-state)
- [Disclaimer](#disclaimer)
- [Roadmap](#roadmap)

---

## Kenapa ARBCheck?

Sebelum lo `transfer`, `approve`, atau beli token asing, tempel address-nya ke ARBCheck. Dalam hitungan detik lo dapat:

1. **Risk Score 0–100** + level `LOW / MEDIUM / HIGH`
2. **Safety Rating 1.0–10.0** + grade `A+ sampai F`
3. **Checklist 8 modul** (mint, owner, tax, blacklist, pause, holder, liquidity, verifikasi)
4. **Bukti on-chain** (bytecode selector, live `owner()`, `buyTax()`, `paused()`, link Arbiscan/Etherscan)

Tanpa connect wallet untuk scan. Tanpa gas fee. Tanpa private key.

---

## Fitur Utama

### 1. Scanner Multi-Chain (4 Network)
Selector network tersedia di Navbar, HeroSearch, TestLab, dan API Explorer. Ganti chain = RPC + explorer + daftar token demo ikut ganti, plus auto `wallet_switchEthereumChain` di MetaMask.

| Network | Chain ID | Hex | Explorer | Tipe |
|---|---|---|---|---|
| Arbitrum Sepolia | `421614` | `0x66eee` | sepolia.arbiscan.io | Testnet (default) |
| Arbitrum One | `42161` | `0xa4b1` | arbiscan.io | Mainnet |
| Ethereum Mainnet | `1` | `0x1` | etherscan.io | Mainnet |
| Ethereum Sepolia | `11155111` | `0xaa36a7` | sepolia.etherscan.io | Testnet |

Tiap network punya `rpc` + `fallbackRpcs` (PublicNode, drpc, 1rpc) dengan timeout 4 detik per endpoint.

### 2. Dual Rating
- **Risk Score 0–100** — makin besar makin berbahaya (akumulasi penalti).
- **Safety Rating 1.0–10.0** — rumus `max(1.0, (100 - risk) / 10)`. Makin besar makin aman.
- **Rating Simulator** di tab `ScanResult` — centang backdoor hipotesis (mint, blacklist, tax, dll) dan lihat rating turun real-time.

### 3. 8 Modul Deteksi
1. **Verification** — ERC-20 interface valid atau tidak
2. **Ownership** — owner aktif vs renounced (`0x000...000`)
3. **Mintability** — ada selector `mint(address,uint256)` di bytecode?
4. **Tax** — live `buyTax()` / `sellTax()`, normalisasi basis-point
5. **Blacklist** — selector blacklist/freeze + probe `isBlacklisted(0x0)`
6. **Pause** — live `paused()` + selector `pause()/unpause()`
7. **Holder Dispersion** — placeholder analitik distribusi top-10
8. **Liquidity** — status lock LP (DEX router belum di-index di MVP)

### 4. Test Lab (Sandbox)
Kartu token per network + form interaktif `transfer / mint / approve / renounce / setTaxes / setBlacklist / setPaused`. Semua write wajib konfirmasi wallet. Token `honeypot` dan `tax` punya simulasi edukasi khusus (transfer revert, potongan fee 20%).

### 5. API Explorer (Mock UI)
Form `POST /api/scan` dengan input `address + chainId`, generator cURL, dan viewer JSON `{riskScore, riskLevel, rating10, checks[], breakdown}`. Eksekusinya memanggil `scanContract()` lokal, bukan server beneran.

---

## Demo Token per Network

| Network | Token | Address | Risiko | Rating |
|---|---|---|---|---|
| Arb Sepolia | SAFE | `0x71C8…B662` | LOW 0 | 10.0 (A+) |
| Arb Sepolia | MINT | `0x3A8F…B011` | MEDIUM 35 | 6.5 (B-) |
| Arb Sepolia | TAX | `0x9E2a…9274` | MEDIUM 55 | 4.5 (C) |
| Arb Sepolia | HONEY | `0xFA48…C091` | HIGH 85 | 1.5 (F) |
| Arb One | ARB | `0x912C…6548` | LOW 10 | 9.0 (A+) |
| Arb One | WETH | `0x82aF…ab1` | LOW 0 | 10.0 (A+) |
| Eth Mainnet | UNI | `0x1f98…F984` | LOW 5 | 9.5 (A+) |
| Eth Mainnet | USDT | `0xdAC1…ec7` | MEDIUM 45 | 5.5 (B-) |
| Eth Sepolia | WETH | `0xfFf9…6B14` | LOW 0 | 10.0 (A+) |

> Address di atas adalah data kurasi di `src/constants/arbitrum.js` untuk demo cepat. Address hasil deploy lokal lo ada di `deployed-contracts.json` + `.env.example`.

---

## Tech Stack

- **Frontend:** React 19, Vite 8, `ethers` v6, `lucide-react`, CSS murni (gaya RugCheck/Arbiscan, dark, Inter + JetBrains Mono)
- **Contract:** Solidity `^0.8.20`, OpenZeppelin ERC-20, `solc` via `scripts/compile.js`
- **Tooling:** Node.js, `oxlint`, MetaMask / injected EVM provider
- **Tidak dipakai:** Next.js, Tailwind, wagmi/viem, backend/DB (sengaja dilepas di implementasi MVP ini agar ringan)

---

## Struktur Project

```text
scannerTokenArb/
├── contracts/                  # Solidity test token (Safe, Mintable, Tax, Honeypot)
├── abi/                        # ABI hasil compile (root)
├── scripts/
│   ├── compile.js              # Compile .sol -> abi/ + artifacts.json
│   ├── deploy.js               # Deploy ke Arbitrum Sepolia / simulasi
│   └── artifacts.json          # Bytecode + ABI siap deploy
├── deployed-contracts.json     # Registry hasil deploy terakhir
├── .env.example                # Contoh env (RPC + address hasil deploy)
├── prd.md                      # PRD asli v1.0
├── INTEGRASI-SMART-CONTRACT.md # Panduan integrasi on-chain detail
├── package.json                # Workspace shortcut (dev/build/lint)
└── template-fe-arbitrum-workshop/
    ├── vite.config.js
    ├── package.json
    └── src/                    # <-- aplikasi utama (lihat bawah)
```

---

## Quickstart

```bash
# 1. Install FE
cd template-fe-arbitrum-workshop
npm install

# 2. Jalanin dev server
npm run dev
# atau dari root:
npm run dev

# 3. Build produksi
npm run build

# 4. Lint (oxlint, target 0 error)
npm run lint
```

Buka `http://localhost:5173`, pilih network, paste `0x...`, klik **Scan Contract**. Wallet hanya dibutuhkan untuk Test Lab.

---

## Environment Variable (.env)

**Frontend scan read-only TIDAK butuh `.env`.** RPC public sudah hardcode di `src/constants/arbitrum.js`, jadi scan bisa jalan tanpa API key.

`.env` hanya dipakai oleh **`scripts/deploy.js`**:

```bash
# .env (jangan di-commit!)
PRIVATE_KEY=0xabc...          # deployer, wajib 0x + 64 hex
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
```

Flow-nya:
1. `node scripts/compile.js` → isi `abi/` + `scripts/artifacts.json`
2. Isi `.env` dari `.env.example`, tambah `PRIVATE_KEY` yang punya Sepolia ETH
3. `node scripts/deploy.js` → update `deployed-contracts.json` + regenerate `.env.example`

Kalau `PRIVATE_KEY` kosong / saldo 0, `deploy.js` otomatis masuk mode simulasi (address deterministik, bukan on-chain beneran). Kalau nanti pakai RPC private (Alchemy/Infura) atau WalletConnect ID di Vite, pakai prefix `VITE_`, misal `VITE_ALCHEMY_KEY`, dan baca via `import.meta.env.VITE_ALCHEMY_KEY`.

---

## Smart Contract Test Token

Ada di `contracts/`:

| File | Supply | Ciri |
|---|---|---|
| `SafeToken.sol` | 1.000.000 | Fixed supply, no mint, no tax, no blacklist, renounceable |
| `MintableToken.sol` | 5.000.000 | `mint(address,uint256)` + `onlyOwner` |
| `TaxToken.sol` | 10.000.000 | `buyTax 5%`, `sellTax 20%`, `setTaxes()` owner-only |
| `HoneypotTestToken.sol` | 100.000.000 | `isBlacklisted` mapping + `paused` switch, simulasi transfer revert |

Semua kontrak Solidity `0.8.20` + OpenZeppelin. ABI hasil compile dicopy ke `template-fe-arbitrum-workshop/src/abi/` agar `ethers.Contract` bisa dipakai langsung di browser.

---

## Cara Kerja Scanner

`template-fe-arbitrum-workshop/src/services/scanner.js#scanContract`:

```text
paste 0x... 
 → validateAddress (regex 40 hex)
 → checksum EIP-55
 → cek MULTICHAIN_TOKENS (jalan pintas demo)
 → fetchContractBytecode (coba rpc + fallback, timeout 4s)
 → 0x / 0x0 = EOA, bukan kontrak → error
 → read name/symbol/decimals/totalSupply (allSettled)
 → heuristik bytecode (mint/pause/blacklist/owner selector)
 → live call owner(), buyTax(), sellTax(), paused(), isBlacklisted(0x0)
 → scoring + return report
```

Contoh report (ringkas):

```json
{
  "address": "0x9E2aF0C4113D667Fa98102e3CeE7bEc0959E9274",
  "chainId": 421614,
  "riskScore": 55,
  "riskLevel": "MEDIUM",
  "rating10": { "rating": 4.5, "grade": "C", "tier": "moderate" },
  "tokenInfo": { "name": "Arbitrum Tax Token", "symbol": "TAX" },
  "checks": { "mintability": {...}, "tax": {...}, "blacklist": {...} },
  "scoringBreakdown": [{ "rule": "High sell tax", "points": 20 }]
}
```

---

## Risk Scoring Engine

Transparan, aditif, mulai dari 0 (cap 100). Definisi di `src/constants/arbitrum.js#RISK_WEIGHTS`:

| Faktor | +Poin | Dampak rating 1–10 | Contoh pola |
|---|---|---|---|
| Mintable Supply | +20 | -2.0 | `mint(address,uint256)` |
| Blacklist | +20 | -2.0 | `isBlacklisted(address)` |
| High Sell Tax >10% | +20 | -2.0 | `sellTax = 20%` |
| Active Owner | +15 | -1.5 | `owner() != 0x0` |
| High Holder Concentration | +15 | -1.5 | Top-10 > 50% |
| Liquidity Unlocked | +15 | -1.5 | LP di wallet deployer |
| Pausable | +10 | -1.0 | `pause() / _pause()` |

Klasifikasi: `0–30 LOW` · `31–60 MEDIUM` · `61–100 HIGH`.
Grade rating: `9.0+ A+` · `8.0+ A` · `7.0+ B+` · `5.5+ B-` · `4.0+ C` · `2.5+ D` · `<2.5 F`.

---

## API Explorer

Kontrak API yang disimulasikan di UI (`src/components/ApiExplorer.jsx`):

```bash
curl -X POST https://arbcheck.xyz/api/scan \
  -H "Content-Type: application/json" \
  -d '{"address": "0x71C82B4628E46bF5E7B78096236b9074a3D4B662", "chainId": 421614}'
```

Response:

```json
{
  "address": "0x71C8...",
  "network": "Arbitrum Sepolia",
  "chainId": 421614,
  "riskScore": 0,
  "riskLevel": "LOW",
  "rating10": { "rating": 10.0, "grade": "A+" },
  "checks": [{ "name": "mintability", "status": "PASS" }],
  "breakdown": [],
  "scannedAt": "2026-09-26T00:00:00.000Z"
}
```

---

## Script Compile & Deploy

```bash
node scripts/compile.js              # .sol -> abi/ + src/abi/ + artifacts.json
node scripts/deploy.js               # deploy riil kalau PRIVATE_KEY valid
node scripts/deploy.js 0xPRIVATEKEY  # alternatif via argumen CLI
```

Output deploy: `deployed-contracts.json` (`address`, `transactionHash`, `blockNumber`, `explorerUrl` per kontrak).

---

## Struktur `src/` Frontend

```text
src/
├── main.jsx               # Entry: createRoot(<App />)
├── App.jsx                # State global + routing tab + wallet listener
├── App.css / index.css    # Tema dark + design token
├── assets/                # hero.png + svg bawaan Vite
├── abi/                   # ERC20/Safe/Mintable/Tax/Honeypot JSON + index.js
├── constants/
│   ├── arbitrum.js        # Network, RISK_WEIGHTS, rating, MULTICHAIN_TOKENS
│   └── contract.js        # Legacy workshop RWA (tidak dipakai ARBCheck)
├── services/
│   ├── scanner.js         # scanContract(), heuristik bytecode, scoring
│   └── wallet.js          # connect, switch chain, balance, execute action
└── components/
    ├── Navbar.jsx         # Tab + network dropdown + wallet button
    ├── HeroSearch.jsx     # Search bar + tabel token demo
    ├── ScanResult.jsx     # Report + simulator + bytecode + JSON
    ├── TestLab.jsx        # Sandbox mint/transfer/tax/blacklist/pause
    ├── Methodology.jsx    # Edukasi scoring + daftar chain
    ├── ApiExplorer.jsx    # Playground POST /api/scan
    └── Footer.jsx         # Link Arbiscan + faucet + status chain
```

---

## Error State

| Kondisi | Pesan UI |
|---|---|
| Address bukan `0x` 40 hex | `Invalid contract address format (0x...).` |
| `getCode()` return `0x` | `No smart contract found at this address on {network}.` |
| RPC mati semua | `Unable to reach {network} RPC nodes...` |
| Bukan ERC-20 penuh | Label `Unknown / Non-Standard`, bukan crash |
| Wallet belum install | `No Ethereum wallet detected. Please install MetaMask...` |

Data yang tidak terverifikasi selalu tampil `UNKNOWN`, tidak pernah dianggap aman.

---

## Disclaimer

> ARBCheck menghasilkan **Risk Assessment**, bukan garansi keamanan. Skor berasal dari heuristik bytecode + panggilan read-only. Tidak mendeteksi rug-pull off-chain, manipulasi likuiditas tersembunyi, atau bug proxy/upgrade. Selalu DYOR dan cek audit + explorer sebelum transaksi besar. Token `HoneypotTestToken` hanya untuk testing, jangan dipakai di mainnet.

---

## Roadmap

- [ ] Index holder top-10 + status lock LP real via Subgraph / Covalent
- [ ] Verifikasi source via Arbiscan/Etherscan API
- [ ] Backend `POST /api/scan` beneran + cache + history (Postgres/Drizzle)
- [ ] Support Base, Optimism, BNB Chain
- [ ] Unit test scanner (vitest) + e2e Test Lab

---

**ARBCheck v1.0 (MVP)** — Security & Risk Analysis Engine · Arbitrum Sepolia first, multi-chain ready.
