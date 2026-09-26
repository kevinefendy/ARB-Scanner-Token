PRD: ARBCheck
Arbitrum Token & Smart Contract Risk Scanner
Versi: 1.0 (MVP) · Status: Draft · Network: Arbitrum Sepolia (Testnet)

1. Product Vision
ARBCheck membantu pengguna melakukan pemeriksaan awal terhadap token/smart contract di jaringan Arbitrum sebelum berinteraksi dengannya.

Core value: "Paste an Arbitrum contract. Understand its risks."

Tagline: "Check this Arbitrum token before you touch it."

Bukan: exchange, DEX, atau trading terminal. Fokus: security & risk analysis, satu fungsi utama — paste address → scan → lihat risiko.

Prinsip Produk
Accuracy
Transparency
Simplicity



Speed
Visual polish
Tidak mereplikasi fitur DEX Screener/DexTools. One input → One scan → Clear risk report.

2. Target Network
Parameter	Nilai
Chain	Arbitrum Sepolia
Chain ID	421614
Native token	ETH
RPC	via environment variable
Contract interaction	viem / ethers
Struktur kode dibuat modular agar mudah dipindahkan ke Arbitrum One saat production.

3. Tech Stack
Frontend: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, viem, wagmi, React — fully responsive (desktop/tablet/mobile).

Smart Contract: Solidity, Hardhat (compile/test/deploy), OpenZeppelin Contracts.

Database (opsional MVP): PostgreSQL + Drizzle ORM.

Font: Inter atau Geist. Monospace untuk contract address.

4. Smart Contract — Test Tokens (Arbitrum Sepolia)
Contract	Karakteristik	Deteksi yang diharapkan
SafeToken.sol	ERC20 fixed supply, no mint, no blacklist, no pause, ownership renounceable	Low Risk
MintableToken.sol	Memiliki mint(), owner/admin, supply dapat bertambah	Mintable
TaxToken.sol	Buy tax & sell tax	Tax % terbaca
HoneypotTestToken.sol	Simulasi pembatasan sell/transfer (testing purpose only, tidak boleh mencuri aset)	Transfer restriction detected
Semua kontrak dideploy hanya di Arbitrum Sepolia melalui Hardhat, menghasilkan: contract address, tx hash, network, block number → disimpan di .env/config.

5. Scanner Architecture
Terpisah dari UI, bersifat read-only 100%.

Input address (0x...)
   → Validate address
   → Check network (harus Arbitrum Sepolia)
   → Connect RPC
   → Read contract (ABI, bytecode, ERC20 calls)
   → Run risk analysis modules
   → Generate scoring
   → Display report
Sumber data: ABI, bytecode, totalSupply, decimals, balanceOf, allowance, owner/admin detection, liquidity info (jika tersedia). Tidak boleh mengandalkan nama token dari frontend saja.

6. Risk Checks (MVP)
Check	Status yang ditampilkan
Contract Verification	Verified / Unknown
Ownership	Owner address, Renounced / Active
Mintability	Mintable / Fixed Supply / Unknown
Tax	Buy Tax % / Sell Tax %
Blacklist	Detected / Not Detected
Pause	Detected / Not Detected
Holder Concentration	Top 1 / Top 5 / Top 10 %
Liquidity	Amount, LP address, Locked/Unlocked, atau "Not available" jika data tak tersedia
⚠️ Data yang tidak dapat diverifikasi harus tampil sebagai "Unknown" — tidak boleh dianggap aman dan tidak boleh dikarang.

7. Risk Scoring Engine
Transparan, berbasis penambahan poin per temuan risiko:

Faktor	Poin
Mintable	+20
Active owner	+15
Blacklist	+20
High sell tax	+20
Pause	+10
High holder concentration	+15
Liquidity unlocked	+15
Klasifikasi: 0–30 Low · 31–60 Medium · 61–100 High

Setiap poin harus disertai alasan (explanation). Label yang digunakan: "Risk Assessment" — bukan "Guaranteed Safety". Skor bukan jaminan aman/berbahaya.

Contoh Output — Low Risk (22/100)
✓ Contract verified   ✓ Fixed supply   ✓ Ownership renounced
✓ Buy tax 0%          ✓ Sell tax 0%
⚠ Liquidity not verified   ⚠ Holder concentration 18%
Contoh Output — High Risk (82/100)
🔴 Mintable   🔴 Active owner   🔴 Sell tax 20%   🔴 Blacklist detected
⚠ High holder concentration
8. Halaman & UX
8.1 Homepage (/)
Hero: "Check an Arbitrum Token"
Subtitle: "Analyze smart contract risks before interacting with a token."
Input: "Paste Arbitrum contract address" + tombol "Scan Token"
Network indicator: Arbitrum Sepolia
Link: "Try a test contract"
8.2 Scan Result (/scan/[address])
Header: ARBCheck | Arbitrum Sepolia | Connect Wallet
Token info: Name, Symbol, Address, Decimals, Total Supply
Risk Assessment block: score, level (Low/Medium/High)
Checklist (Contract, Ownership, Mint, Tax, Blacklist, Pause, Liquidity, Holders) — setiap item dapat diklik untuk penjelasan detail
Contract Details: address + copy, link Arbiscan, creator, deployment block/timestamp, verification status
8.3 Testnet Demo (/testnet) — "ARBCheck Test Lab"
Daftar 4 dummy contract (SafeToken, MintableToken, TaxToken, HoneypotTestToken), masing-masing menampilkan: address, nama token, risk profile, tombol Scan / View Contract / Interact.

8.4 Test Lab Interaction
Fungsi terbatas pada token dummy: Mint, Transfer, Approve, Check Balance — semua transaksi wajib konfirmasi wallet, tidak ada transaksi otomatis.

8.5 Navigation
ARBCheck · Scan · Test Lab · Docs · Connect Wallet — tetap sederhana, tanpa mega-menu.

9. Wallet Connection
Library: wagmi + viem
Wallet: MetaMask, WalletConnect
Wallet TIDAK wajib untuk melakukan scan (paste → scan tanpa connect)
Wallet hanya untuk: network switching, interaksi test contract, demo transaction
10. API
POST /api/scan

Request:

{ "address": "0x...", "chainId": 421614 }
Response:

{
  "address": "0x...",
  "chainId": 421614,
  "riskScore": 42,
  "riskLevel": "MEDIUM",
  "checks": [
    { "name": "Mintability", "status": "RISK", "value": true }
  ]
}
Validasi: reject invalid address, wrong network, unsupported chain.

11. Database (opsional, hanya jika diperlukan)
PostgreSQL + Drizzle ORM.

Scan: id, contractAddress, chainId, riskScore, riskLevel, scannedAt RiskCheck: id, scanId, checkName, status, value, explanation

Digunakan hanya untuk scan history, contract metadata, cached results.

12. Error States
Kondisi	Pesan
Invalid address	"Invalid Arbitrum contract address."
Wrong network	"This scanner currently supports Arbitrum Sepolia only."
Contract not found	"No contract found at this address."
Not ERC20	"This contract does not appear to implement the expected ERC20 interface."
Unable to analyze	"Some contract properties could not be determined."
13. Security Principles
Read-only by default, tidak pernah meminta private key/seed phrase
Tidak ada auto-approval, auto-swap, atau unlimited token approval
Semua transaksi wajib user confirmation
RPC URL, API keys, dan Database

 URL disimpan sebagai environment variables
14. Visual Design Language (inspirasi RugCheck.xyz)
Dark background · minimal cards · rounded corners · thin borders · banyak whitespace · tanpa gradient berlebihan · tidak "gaming".

Warna status: 🟢 Hijau = safe/pass · 🟡 Kuning = warning · 🔴 Merah = risk · Putih/abu-abu = typography utama.

15. Project Structure
arbcheck/
├── app/ (page.tsx, scan/[address], testnet, docs, api/scan)
├── components/ (scanner, risk, token, wallet, ui)
├── lib/ (arbitrum.ts, scanner/{ownership,mintability,tax,blacklist,liquidity,holders}.ts, scoring.ts)
├── contracts/ (SafeToken, MintableToken, TaxToken, HoneypotTestToken)
├── scripts/deploy.ts
├── abi/
└── README.md
16. Development Phases
Fase	Deliverable
1	Frontend UI (homepage + scan result, mock data)
2	Setup wagmi + viem, koneksi Arbitrum Sepolia
3	Deploy 4 test contract
4	Implementasi contract scanner
5	Implementasi risk scoring engine
6	Hubungkan scanner ke data blockchain real
7	Implementasi Test Lab
8	Polish UI, loading/error state, responsive
17. Out of Scope (MVP)
Trading, swap, deposit, custodial wallet
Dukungan multi-chain di luar Arbitrum Sepolia
Dashboard/chart kompleks
18. Target Experience (End-to-End)
User membuka homepage → "Check an Arbitrum Token"
Paste 0x123... → klik "Scan Token"
Loading: "Analyzing contract..."
Hasil: Risk Assessment (score + level) + checklist detail per indikator (klik untuk expand)
Tidak ada trading/swap/deposit — murni pemahaman risiko.