# ARBCheck — Multi-Chain Token & Smart Contract Risk Scanner

> **"Check any token contract before you touch it."**  
> Security and risk analysis for tokens & smart contracts across **Arbitrum Sepolia**, **Arbitrum One**, **Ethereum Mainnet**, and **Ethereum Sepolia**.

---

## Fitur Utama

- **Dukungan 4 Jaringan Blockchain**:
  1. **Arbitrum Sepolia** (Chain ID: `421614` / `0x66eee`)
  2. **Arbitrum One (Mainnet)** (Chain ID: `42161` / `0xa4b1`)
  3. **Ethereum Mainnet** (Chain ID: `1` / `0x1`)
  4. **Ethereum Sepolia** (Chain ID: `11155111` / `0xaa36a7`)
  - Dilengkapi selector jaringan multi-chain di header, hero bar, dan test lab.
  - Wallet network switcher otomatis untuk MetaMask / injected EVM provider.

- **Dual Rating & Scoring Engine**:
  - **1.0 – 10.0 Security Health Rating**:
    - `9.0 – 10.0` (Grade A+): Exceptional Security
    - `8.0 – 8.9` (Grade A): Strong Security Profile
    - `7.0 – 7.9` (Grade B+): Standard Safeguards
    - `5.5 – 6.9` (Grade B-): Moderate Caution / Admin Privileges
    - `4.0 – 5.4` (Grade C): Elevated Risk Factors
    - `2.5 – 3.9` (Grade D): High Hazard / Restrictive Mechanics
    - `1.0 – 2.4` (Grade F): Critical Risk / Honeypot Traps
  - **10-Segment Discrete Meter Bar**: Tampilan visual 10 segmen terukur per level keamanan.
  - **1-10 Rating Simulator & Impact Tester**: Tab interaktif untuk menguji dampak deteksi risiko terhadap skor 1-10 secara real-time.
  - **0 – 100 Risk Penalty Metric**: Rincian penalti transparan (+20 Mintable, +15 Owner, +20 Tax, dsb).

- **8 Modul Deteksi Risiko**:
  1. **Contract Verification**: Status verifikasi source code di explorer.
  2. **Ownership & Privileges**: Deteksi owner aktif vs renounced (0x0).
  3. **Mintability Analysis**: Deteksi selektor fungsi `mint()` yang dapat mendilusi supply.
  4. **Buy & Sell Tax Structure**: Perhitungan persentase tax transfer.
  5. **Blacklist Capabilities**: Deteksi selektor pembatasan transfer atau pembekuan akun.
  6. **Pausable Transfers**: Deteksi mekanisme emergency pause oleh admin.
  7. **Holder Concentration**: Analisis konsentrasi wallet top holders.
  8. **Liquidity Analysis**: Status lock pool LP dan verifikasi DEX.

- **ARBCheck Test Lab Multi-Chain**:
  - Menyediakan token referensi & uji pada seluruh jaringan:
    - *Arbitrum Sepolia*: SafeToken, MintableToken, TaxToken, HoneypotTestToken
    - *Arbitrum One*: ARB, WETH
    - *Ethereum Mainnet*: UNI, USDT
    - *Ethereum Sepolia*: Sepolia WETH
  - Sandbox interaktif: Mint, Transfer, Approve, dan Check Balance.

- **API Reference & Interactive Explorer**:
  - Mengimplementasikan endpoint `POST /api/scan` dengan multi-chain `chainId` selector, generator cURL, dan respons JSON lengkap dengan `rating10`.

- **UI Non-AI Slop**:
  - Desain keamanan bertema dark cyber/DeFi terinspirasi dari RugCheck.xyz & Arbiscan.
  - Tipografi rapi (Inter + JetBrains Mono), border halus, whitespace terukur.
  - **Zero Emojis**: Menggunakan icon SVG profesional dari `lucide-react`.

---

## Menjalankan Aplikasi

```bash
# Menjalankan development server
npm run dev

# Memeriksa linter (0 errors, 0 warnings)
npm run lint

# Membangun bundle produksi
npm run build
```
