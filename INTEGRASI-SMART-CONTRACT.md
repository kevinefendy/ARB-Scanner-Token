# Panduan Integrasi Smart Contract ARBCheck

Dokumen ini menjelaskan arsitektur integrasi penuh smart contract pada aplikasi **ARBCheck (Arbitrum Token & Smart Contract Risk Scanner)** sesuai dengan spesifikasi PRD.

---

## 1. Daftar Smart Contract (Arbitrum Sepolia)

Semua kontrak ditulis dalam Solidity `^0.8.20` dan dioptimalkan untuk pengujian scanner risiko:

| Kontrak | Karakteristik Utama | Risk Score / Level | Rating (1-10) |
| :--- | :--- | :--- | :--- |
| **`SafeToken.sol`** | ERC20 fixed supply (1M SAFE), tanpa `mint()`, tanpa blacklist, tanpa pause, ownership renounceable. | **0 / 100** (LOW RISK) | **10.0 / 10** (A+) |
| **`MintableToken.sol`** | ERC20 supply 5M MINT dengan fungsi `mint(address, uint256)` aktif yang dikontrol owner. | **35 / 100** (MEDIUM RISK) | **6.5 / 10** (B-) |
| **`TaxToken.sol`** | ERC20 supply 10M TAX dengan 5% buy tax dan 20% sell tax yang dipotong otomatis saat transfer. | **55 / 100** (MEDIUM RISK) | **4.5 / 10** (C) |
| **`HoneypotTestToken.sol`** | Token simulasi restriksi transfer dengan mapping `isBlacklisted` dan switch `paused`. | **85 / 100** (HIGH RISK) | **1.5 / 10** (F) |

---

## 2. Struktur File & ABI

```text
scannerTokenArb/
├── contracts/
│   ├── SafeToken.sol
│   ├── MintableToken.sol
│   ├── TaxToken.sol
│   └── HoneypotTestToken.sol
├── abi/
│   ├── SafeToken.json
│   ├── MintableToken.json
│   ├── TaxToken.json
│   ├── HoneypotTestToken.json
│   └── IERC20.json
├── scripts/
│   ├── compile.js          # Mengompilasi Solidity via solc compiler
│   ├── deploy.js           # Deployer otomatis ke Arbitrum Sepolia
│   └── artifacts.json      # Bytecode & ABI hasil build
└── template-fe-arbitrum-workshop/
    └── src/
        ├── abi/            # Modul ABI untuk runtime React/Vite
        │   ├── SafeToken.json
        │   ├── MintableToken.json
        │   ├── TaxToken.json
        │   ├── HoneypotTestToken.json
        │   ├── ERC20.json
        │   └── index.js
        ├── constants/
        │   └── arbitrum.js # Konstanta jaringan & daftar token referensi
        ├── services/
        │   ├── scanner.js  # Engine scanner on-chain & bytecode heuristic
        │   └── wallet.js   # Interaksi smart contract on-chain & wallet switch
        └── components/
            ├── ScanResult.jsx
            └── TestLab.jsx # Sandbox interaktif eksekusi smart contract
```

---

## 3. Cara Mengompilasi Kontrak

Jalankan perintah berikut di root repositori:

```bash
node scripts/compile.js
```

Script ini akan:
1. Membaca file `.sol` di dalam folder `contracts/`.
2. Mengompilasi bytecode dengan optimizer enabled (200 runs).
3. Mengekstrak ABI ke `abi/` dan `template-fe-arbitrum-workshop/src/abi/`.
4. Menyimpan bytecode siap deploy ke `scripts/artifacts.json`.

---

## 4. Cara Deploy ke Arbitrum Sepolia

### Opsi A: Menggunakan Private Key Riil (Arbitrum Sepolia Testnet)
Pastikan dompet Anda memiliki testnet ETH Arbitrum Sepolia (bisa didapatkan di faucet https://faucets.chain.link/arbitrum-sepolia):

```bash
# Set environment variable atau pasang di .env
export PRIVATE_KEY="0xYOUR_TESTNET_PRIVATE_KEY"
node scripts/deploy.js
```

Atau passing langsung sebagai argumen:
```bash
node scripts/deploy.js 0xYOUR_TESTNET_PRIVATE_KEY
```

### Opsi B: Dry-run / Deterministic Simulation (Tanpa Gas ETH)
Jika dijalankan tanpa `PRIVATE_KEY`, script otomatis melakukan simulasi deployment deterministik:

```bash
node scripts/deploy.js
```

Hasil deployment akan tersimpan di:
- `deployed-contracts.json`
- `.env.example`

---

## 5. Cara Frontend Terintegrasi dengan Smart Contract

1. **Scanner On-Chain Query (`src/services/scanner.js`)**:
   - Membaca bytecode kontrak via RPC `eth_getCode`.
   - Mengambil data ERC20: `name()`, `symbol()`, `decimals()`, `totalSupply()`.
   - Melakukan probe on-chain untuk `owner()`, `buyTax()`, `sellTax()`, `paused()`, dan `isBlacklisted()`.
   - Menghitung Risk Score (0-100) dan Rating Keamanan (1.0 - 10.0) berdasarkan bobot PRD.

2. **Test Lab Sandbox (`src/components/TestLab.jsx` & `src/services/wallet.js`)**:
   - **SafeToken**: Pengguna dapat melakukan transfer dan memanggil `renounceOwnership()` langsung ke smart contract.
   - **MintableToken**: Pengguna dapat memanggil fungsi owner `mint()` untuk menambah suplai token.
   - **TaxToken**: Pengguna dapat memanggil `setTaxes()` atau melakukan simulasi transfer dengan potongan pajak 20%.
   - **HoneypotTestToken**: Pengguna dapat menguji `setBlacklist()`, `setPaused()`, serta mengamati bagaimana transfer non-whitelisted langsung ditolak on-chain (`TRANSFER_RESTRICTED_HONEYPOT`).
