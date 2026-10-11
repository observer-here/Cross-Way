<div align="center">

<img src="web/public/logo.png" alt="Cross Way" width="96" />

# Cross Way

**⚡ Send. Receive. Anyone. Anywhere. 🌍**

A stablecoin payments app on [Arc](https://docs.arc.io) 💸
Sign in with an email, get a wallet automatically, and pay anyone by username, email, EVM address or user ID, in USDC or EURC.

![Network](https://img.shields.io/badge/Network-Arc%20Mainnet-4f46e5?style=for-the-badge&logo=ethereum&logoColor=white)
![Chain ID](https://img.shields.io/badge/Chain%20ID-5042-7c3aed?style=for-the-badge)
![USDC](https://img.shields.io/badge/USDC-supported-2775ca?style=for-the-badge)
![EURC](https://img.shields.io/badge/EURC-supported-0ea5e9?style=for-the-badge)
![Fee](https://img.shields.io/badge/Fee-0.5%25-10b981?style=for-the-badge)
![Tests](https://img.shields.io/badge/Contract%20tests-2%20passing-22c55e?style=for-the-badge)

![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?style=flat-square&logo=solidity&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f38020?style=flat-square&logo=cloudflare&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-4-e36002?style=flat-square)
![Privy](https://img.shields.io/badge/Auth-Privy-676fff?style=flat-square)
![Vercel](https://img.shields.io/badge/Web-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

[🐙 GitHub](https://github.com/observer-here/Cross-Way) ·
[📚 Arc Docs](https://docs.arc.io) ·
[🔎 Arc Explorer](https://explorer.arc.io) ·
[📜 Contract](https://explorer.arc.io/address/0x7574a58077eDaC8B48FD7D07B1dB16b8FB347c84)

</div>

---

## 🧭 Table of contents

1. [📖 Overview](#-overview)
2. [✨ Features](#-features)
3. [🔄 How it works](#-how-it-works)
4. [🧱 Architecture](#-architecture)
5. [🧰 Tech stack](#-tech-stack)
6. [🌐 Network and addresses](#-network-and-addresses)
7. [📁 Project structure](#-project-structure)
8. [📜 Smart contract](#-smart-contract)
9. [🔌 Backend](#-backend)
10. [🎨 Frontend](#-frontend)
11. [🔑 Environment variables](#-environment-variables)
12. [🚀 Getting started](#-getting-started)
13. [🧪 Testing](#-testing)
14. [📦 Deployment](#-deployment)
15. [🩺 Operations and troubleshooting](#-operations-and-troubleshooting)
16. [🚧 Known limitations](#-known-limitations)
17. [🔒 Security](#-security)
18. [🤝 Contributing](#-contributing)
19. [🔗 Links](#-links)

---

## 📖 Overview

Cross Way makes paying someone as simple as knowing their username or email.

- Users log in with an **email code**. [Privy](https://privy.io) creates an **embedded wallet**, so there is no seed phrase and no browser extension.
- Every user gets a unique **username** (for example `username12`) and a random 8-character **user ID**. Both can be used to receive money, and the username can be changed.
- Payments are made in **USDC** and **EURC** on **Arc Mainnet**, where USDC is also the gas token.
- A single smart contract handles direct payments, payment requests and shareable payment links, and takes a **0.5% fee** on every payment.
- Funds never sit in the contract. They move straight from the payer's wallet to the recipient using `transferFrom`.

## ✨ Features

### 💸 Payments
- **Send** to a username, email, EVM address or user ID, with a recent-people list and a review step before confirming.
- **Request** money from a specific person. Only that person's wallet can pay the request.
- **Payment links** that anyone with an account can open and pay.
- **Expiry** of 1, 7 or 30 days on every request and link (the contract allows up to 90 days).
- **Cancel** an open request or link at any time as the payee.
- **Messages** of up to 200 characters attached to a payment, stored on-chain with the transaction.
- **Fee preview** (platform fee and what the recipient gets) shown before you confirm.

### 📱 QR codes
- **My code** shows your own QR (a link to the Send page prefilled with your wallet), with a USDC/EURC toggle.
- **Scan** opens the camera and decodes QR codes live. It also accepts an uploaded image as a fallback.
- Scanned wallet addresses open Send, and scanned payment links open the Pay page.
- The app logo sits in the centre of every generated QR.

### 👤 Account
- Automatic profile creation on first login (username, user ID, wallet, email).
- Editable username (3 to 48 characters: lowercase letters, numbers and underscore).
- Avatar upload (JPEG, PNG or WebP, up to 400 KB).
- Wallet address with a link to the explorer.

### 📊 Dashboard and history
- USDC and EURC balances with skeleton loaders while data loads.
- **Recent activity** (4 items) and **pending requests** on the home screen.
- Full **history** with pagination, and a **transaction detail** page for each payment.
- Local-time formatting and statuses for requests: Pending, Completed, Expired, Cancelled.

### 🌗 Interface
- Light and dark themes, with no flash of the wrong theme on reload.
- Mobile-first layout that has been checked at 320 px up to 1440 px, with long addresses, messages and error text wrapping instead of overflowing.
- No flash of unstyled background on refresh (the page gradient is inlined in `index.html`).

## 🔄 How it works

### 1️⃣ Login and profile
1. The user enters an email on `/login`, and Privy sends a one-time code.
2. Privy creates an embedded Ethereum wallet for the user.
3. The web app sends the Privy access token to `GET /v1/me`.
4. On a first login the API returns `404`, so the app calls `POST /v1/me`. The Worker verifies the token, reads the user's email and wallet from the Privy API, and creates the profile with a generated username and user ID.

### 2️⃣ Sending money
1. The user types a recipient. A username, email or user ID is resolved to a wallet through `GET /v1/lookup`. A raw `0x` address is used as-is.
2. The wallet sends an ERC-20 **`approve`** for exactly the amount.
3. The wallet calls **`sendToAddress`** on the CrossWay contract.
4. The contract takes 0.5% to the owner and sends the rest to the recipient in the same transaction.
5. The app refreshes balances and activity about 3 seconds later.

### 3️⃣ Requests and links
1. The payee calls `createRequest` (for a named payer) or `createLink` (open to anyone). The contract stores an invoice and emits `InvoiceCreated`.
2. The app waits for the new invoice ID (`GET /v1/tx/:hash/invoice-id`) and shows the share link `/pay/<id>`.
3. The payer opens the link, the app reads the invoice (`GET /v1/invoices/:id`), approves the amount and calls `pay`.
4. The invoice is deleted on payment, and a `Paid` event records who paid whom.

### 💰 Fee example

Sending **10.00 USDC** costs the sender exactly 10.00 USDC plus network gas:

```diff
- sender pays          10.00 USDC
+ recipient receives    9.95 USDC   (99.5%)
! platform fee          0.05 USDC   (0.5%, goes to the contract owner)
```

> [!TIP]
> If the recipient is the owner, no fee is taken.

## 🧱 Architecture

```
┌────────────────────────────┐
│  Browser  (React + Vite)   │
│  pages · features · chain  │
└─────┬─────────┬────────┬───┘
      │         │        │
      │         │        └────────────► Privy  (email login, embedded wallet, signing)
      │         │
      │         └─────────────────────► Arc RPC  (writes: approve, send, request, pay, cancel)
      │                                       │
      │                                       ▼
      │                               CrossWay contract
      ▼
┌────────────────────────────┐
│  Cloudflare Worker (Hono)  │
│  /v1 API                   │
├────────────────────────────┤
│  D1  users, usernames,     │
│      avatars, counters     │
│  Arc RPC  token balances   │
│  Arc explorer API          │
│      transfers + contract  │
│      events (invoices)     │
│  Privy API  profile sync   │
│  Cache API  wallet cache   │
└────────────────────────────┘
```

- **Writes** go from the user's wallet straight to Arc. The backend never holds keys or signs anything.
- **Reads** for balances, activity and invoices go through the Worker so the browser makes one call and results can be cached.
- **Identity** (username, email, user ID to wallet) lives only in D1. The contract knows only addresses.

## 🧰 Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 19, Vite 6, TypeScript, Tailwind CSS 4, React Router 7 |
| Wallet and auth | Privy (`@privy-io/react-auth`), viem |
| QR | `qrcode` (generate), `jsqr` (decode), `getUserMedia` (camera) |
| Backend | Cloudflare Workers, Hono, D1 (SQLite), `jose` (JWT verification) |
| Contracts | Solidity 0.8.28, Hardhat, ethers v6, Chai |
| Chain | Arc Mainnet (USDC native gas, sub-second blocks) |

## 🌐 Network and addresses

| | |
|---|---|
| Network | Arc Mainnet |
| Chain ID | `5042` |
| RPC | `https://rpc.mainnet.arc.io` |
| Explorer | https://explorer.arc.io |
| Explorer API | `https://explorer.arc.io/api/v2` (Blockscout v2) |
| Gas token | USDC (18 decimals natively; the ERC-20 interface uses 6) |
| USDC | `0x3600000000000000000000000000000000000000` |
| EURC | `0xbEf5f6d51CB62b58e6A8f77868681825C6fe21c1` |
| CrossWay contract | `0x7574a58077eDaC8B48FD7D07B1dB16b8FB347c84` |
| Contract owner and fee wallet | `0xA7b4c3A498B7FE206fCD3888bDe6b72264729f4a` |
| API | `https://crossway-api.dartajamul108.workers.dev` |

> [!NOTE]
> Arc's base fee is currently 20 gwei, and the app sends transactions with a 20 gwei max fee. Deploying the contract cost roughly 0.02 USDC.

## 📁 Project structure

```
.
├── contracts/
│   ├── src/CrossWay.sol         Payment contract
│   ├── src/mocks/MockERC20.sol  Test token
│   ├── tests/CrossWay.ts        Hardhat tests
│   ├── scripts/deploy.ts        Deploy script
│   └── hardhat.config.ts        `arc` network (chain 5042)
│
├── backend/
│   ├── migrations/              D1 schema (users, avatars, username counter)
│   ├── wrangler.toml            Worker config and chain variables
│   └── src/
│       ├── app.ts               Hono app, CORS, error handler
│       ├── index.ts             Worker entry
│       ├── env.ts               Bindings and variables types
│       ├── middleware/auth.ts   Privy bearer-token check
│       ├── providers/privy.ts   JWT verification and Privy user lookup
│       └── modules/
│           ├── chain/           Balances, activity, invoices (routes, wallet, scan)
│           └── users/           Profiles, lookup, avatars (routes, service, repo)
│
└── web/
    ├── index.html               Critical CSS (gradient) and theme script
    ├── public/                  Logo and SPA redirect
    └── src/
        ├── app/                 Router and app layout
        ├── auth/                Privy provider, session, route guard
        ├── api/                 API client and user endpoints
        ├── chain/               Chain config, ABI, read and write helpers
        ├── features/            Dashboard widgets and send helpers
        ├── pages/               One file per screen
        ├── shared/ui/           Avatar, fields, logo, QR
        ├── lib/format.ts        Amount, fee, time and address helpers
        ├── config/env.ts        Environment access
        └── theme.tsx            Light and dark theme
```

## 📜 Smart contract

`contracts/src/CrossWay.sol` is a small, dependency-free contract. USDC and EURC are hardcoded as allowed tokens, and the owner can allow extra tokens.

### Functions

| Function | Caller | Description |
|---|---|---|
| `sendToAddress(to, token, amount, memo)` | anyone | Pay an address now. Takes the fee and emits `Paid` (method `0`). |
| `createRequest(payer, token, amount, expiresAt, memo)` | payee | Open an invoice only `payer` can pay. Returns the invoice ID. |
| `createLink(token, amount, expiresAt, memo)` | payee | Open an invoice anyone can pay. Returns the invoice ID. |
| `pay(id, memo)` | payer | Pay an invoice. Deletes it, takes the fee, emits `Paid` (method `1` for a request, `2` for a link). |
| `cancel(id)` | payee | Delete an open invoice and emit `InvoiceCancelled`. |
| `setToken(token, allowed)` | owner | Allow or block an extra ERC-20 token. |
| `setOwner(next)` | owner | Transfer ownership (and fee receipt). |

### Rules and invariants
- `FEE_BPS = 5` over a base of 1000, so the fee is **0.5%** of the amount.
- The fee goes to `owner`. If the recipient is the owner, no fee is charged.
- Amounts must be greater than zero, and the token must be USDC, EURC or an allowed extra token.
- Invoice expiry must be in the future and at most **90 days** (`MAX_EXPIRY`) from creation.
- `pay` reverts if the invoice is closed, expired (`NotDue`) or the caller is not the named payer (`NotPayer`).
- `cancel` reverts unless the caller is the payee.
- Native USDC sent directly to the contract is rejected (`receive()` reverts), and the contract is guarded against reentrancy.
- The contract holds no balances. Everything is moved with `transferFrom`.

### Events

```solidity
event Paid(address indexed from, address indexed to, address indexed token, uint256 amount, uint8 method, uint256 refId, bytes memo);
event InvoiceCreated(uint256 indexed id, address indexed payee, address indexed payer, address token, uint256 amount, uint64 expiresAt, bytes memo);
event InvoiceCancelled(uint256 indexed id);
```

The backend derives invoice state from these events, since paid and cancelled invoices are deleted from contract storage.

### Errors
`NotOwner`, `Reentrant`, `ZeroAmount`, `ZeroAddress`, `TokenNotAllowed`, `BadExpiry`, `Closed`, `NotSender`, `NotDue`, `NotPayer`, `TransferFailed`, `NativeDisabled`.

## 🔌 Backend

A single Cloudflare Worker serves the API under `/v1`. Errors are always JSON in the form `{ "error": "message" }`.

### Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/health` | none | Returns `{ "ok": true }`. |
| GET | `/wallets/:addr` | none | Returns `balances` (`usdc`, `eurc`), up to 20 recent `activity` items and up to 8 `invoices` for a wallet. Cached for 30 seconds; add `?fresh=1` to skip the cache. |
| GET | `/invoices/:id` | none | Returns payee, payer, token, amount, raw amount, expiry, memo and whether it is closed. `404` if it does not exist. |
| GET | `/tx/:hash/invoice-id` | none | Returns `{ "id": "<invoice id>" }` for a transaction that created an invoice, or `null`. |
| GET | `/lookup` | none | Finds a user by `q` (auto-detects email, `0x` wallet, username or user ID) or by `email`, `username`, `userId` or `wallet`. Returns public fields only. |
| GET | `/avatars/:id` | none | Returns the profile picture bytes (cached for an hour). |
| GET | `/me` | Bearer | Returns your profile, or `404` if it has not been created yet. |
| POST | `/me` | Bearer | Creates your profile from your Privy account (email and wallet required). |
| PATCH | `/me` | Bearer | Updates your `username`. Returns `409` if it is taken and `400` if it is invalid. |
| PUT | `/me/avatar` | Bearer | Uploads an avatar as the raw request body (JPEG, PNG or WebP, 32 bytes to 400 KB). |

Authentication is a Privy access token sent as `Authorization: Bearer <token>`. The Worker verifies it against Privy's JWKS for your app ID.

### Data model (D1)

```sql
users (
  id TEXT PRIMARY KEY,            -- Privy user ID
  email TEXT UNIQUE,
  username TEXT UNIQUE,           -- e.g. username12
  user_id TEXT UNIQUE,            -- random 8 characters
  wallet TEXT UNIQUE,
  created_at INTEGER, updated_at INTEGER
)
meta ( key TEXT PRIMARY KEY, value INTEGER )   -- 'username_n' counter
```

Avatars are stored alongside the user row (migration `0002`). Usernames are assigned from an atomic counter (`username1`, `username2`, and so on), with retries if a name is already taken. Lookups are case-insensitive.

### Where on-chain data comes from
- **Balances:** a batched `eth_call` to `balanceOf` for USDC and EURC on the Arc RPC. This is fast and unaffected by wallets holding many spam tokens.
- **Activity:** the explorer API's ERC-20 transfers for the wallet, filtered to USDC and EURC and with fee transfers removed.
- **Invoices:** the explorer API's logs for the CrossWay contract, decoded into created, paid and cancelled states.
- The explorer API sits behind Cloudflare bot protection, so the Worker sends the explorer's own `Origin` and `Referer` headers on those requests (`modules/chain/scan.ts`).

## 🎨 Frontend

### Routes

| Route | Access | Screen |
|---|---|---|
| `/` | public | Landing page |
| `/login` | public | Email login |
| `/app` | signed in | Dashboard: balance, quick actions, recent activity, pending requests |
| `/send` | signed in | Send form, review step and success screen |
| `/request` | signed in | Create a request, and list your requests with status and cancel |
| `/links` | signed in | Create a shareable payment link |
| `/scan` | signed in | Camera scanner (`/scan?me=1` shows your own QR code) |
| `/pay/:id` | signed in | Review and pay (or cancel) an invoice |
| `/history` | signed in | Full activity with pagination |
| `/tx/:hash` | signed in | Transaction detail with explorer link |
| `/settings` | signed in | Profile, username, avatar, wallet, activity |
| `*` | public | Not found |

### Notes on how it is built
- **Session:** `auth/session.tsx` keeps the profile in React context and caches it in `localStorage` so the header and name render instantly on reload.
- **Data fetching:** `chain/read.ts` memoises wallet data for 45 seconds and de-duplicates in-flight requests, so the dashboard, activity and send pages share one API call. A fresh reload is triggered 3 seconds after any transaction.
- **Amounts:** `lib/format.ts` accepts positive amounts with up to 6 decimals and converts them with `parseUnits`.
- **Gas:** transactions use the fixed fee settings in `chain/arc.ts` (`GAS`).
- **Theming:** the page background gradient lives only in `web/index.html` so it paints before JavaScript loads. Dark mode adds a `dark` class to `<html>`.
- **Layout safety:** a global rule keeps grid columns shrinkable so long content never forces a horizontal scroll.

## 🔑 Environment variables

### `web/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the Worker API |
| `VITE_PRIVY_APP_ID` | Privy app ID |

### `backend/.dev.vars` (local) and Worker secrets (production)

| Variable | Description |
|---|---|
| `PRIVY_APP_ID` | Privy app ID (secret) |
| `PRIVY_APP_SECRET` | Privy app secret (secret) |

### `backend/wrangler.toml` (plain variables)

| Variable | Value |
|---|---|
| `FRONTEND_ORIGIN` | Allowed CORS origin (`*` by default; set your site URL to lock it down) |
| `CONTRACT_ADDRESS` | CrossWay contract |
| `ARCSCAN_URL` | `https://explorer.arc.io/api/v2` |
| `RPC_URL` | `https://rpc.mainnet.arc.io` |
| `USDC`, `EURC` | Token addresses |
| `FEE_TO` | Fee wallet (used to hide fee transfers from activity) |

### `contracts/.env`

| Variable | Description |
|---|---|
| `ARC_RPC_URL` | RPC URL (defaults to the Arc mainnet primary RPC) |
| `PRIVATE_KEY` | Deployer private key. The wallet needs a little USDC for gas. |

## 🚀 Getting started

**Requirements:** Node.js 20 or newer, a [Privy](https://dashboard.privy.io) app (email login enabled and embedded wallets set to create on login), and a [Cloudflare](https://dash.cloudflare.com) account for the backend.

```bash
git clone https://github.com/observer-here/Cross-Way.git
cd Cross-Way
```

### 1. Backend

```bash
cd backend
npm install
cp .dev.vars.example .dev.vars     # fill in PRIVY_APP_ID and PRIVY_APP_SECRET
npm run db:local                    # apply migrations to the local D1
npm run dev                         # http://127.0.0.1:8787
```

### 2. Web

```bash
cd web
npm install
cp .env.example .env                # set VITE_API_URL and VITE_PRIVY_APP_ID
npm run dev                         # http://127.0.0.1:5173
```

For local work, point `VITE_API_URL` at `http://127.0.0.1:8787`.

### 3. Contracts

```bash
cd contracts
npm install
npm test
```

### Scripts

| Folder | Script | Purpose |
|---|---|---|
| `web` | `npm run dev` | Start the Vite dev server |
| `web` | `npm run build` | Type-check and build to `dist/` |
| `web` | `npm run preview` | Preview the production build |
| `backend` | `npm run dev` | Run the Worker locally |
| `backend` | `npm run deploy` | Deploy the Worker |
| `backend` | `npm run db:local` / `db:remote` | Apply D1 migrations locally or remotely |
| `contracts` | `npm run compile` | Compile contracts |
| `contracts` | `npm test` | Run the contract tests |
| `contracts` | `npm run deploy` | Deploy to Arc Mainnet |

## 🧪 Testing

- **Contracts:** `cd contracts && npm test` runs Hardhat tests that cover the 0.5% fee on direct sends, requests, payment links, the `NotPayer` and `Closed` reverts, and cancelling.
- **Type checks:** run `npx tsc --noEmit` in `web` and in `backend`.
- **Build:** `npm run build` in `web` must pass before deploying.
- **Manual checks:** after any change to the layout, check the Send review step at 320 px with a long message and a full address.

## 📦 Deployment

### Contract (Arc Mainnet)
1. Copy `contracts/.env.example` to `contracts/.env` and set `PRIVATE_KEY`.
2. Fund the wallet with a little USDC (about 0.03 USDC covers the deploy).
3. Run `npm run deploy` in `contracts/`.
4. Put the printed address in `web/src/chain/arc.ts` and `CONTRACT_ADDRESS` in `backend/wrangler.toml`.

The contract address is derived from the deployer address and its transaction count, so the first deploy from a fresh wallet lands at a predictable address.

### Backend (Cloudflare Workers)
```bash
cd backend
npx wrangler login
npx wrangler d1 create crossway          # copy database_id into wrangler.toml
npm run db:remote                        # apply migrations
npx wrangler secret bulk .dev.vars       # PRIVY_APP_ID and PRIVY_APP_SECRET
npm run deploy
curl https://<your-worker>.workers.dev/v1/health
```

### Web (Vercel)
- **Root directory:** `web`
- **Framework preset:** Vite
- **Build command:** `npm run build`, **output directory:** `dist`
- **Environment variables:** `VITE_API_URL` and `VITE_PRIVY_APP_ID`
- **SPA routing:** the app uses client-side routing, so add a `vercel.json` in `web/` that rewrites every path to `/index.html`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### Privy dashboard
- Enable **email** login and **embedded wallets**.
- Add your site's domain to the allowed origins.
- Arc Mainnet (chain ID `5042`) is configured in code, so no custom chain setup is needed.

## 🩺 Operations and troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| Login works but the profile never loads | Check `VITE_API_URL`, and confirm `PRIVY_APP_ID` and `PRIVY_APP_SECRET` are set as Worker secrets. |
| `/v1/wallets/...` returns `internal` | The explorer API call failed. Check `ARCSCAN_URL` and that the Worker still sends the `Origin` and `Referer` headers. |
| Refreshing a page on Vercel gives a 404 | `web/vercel.json` with the SPA rewrite is missing. |
| Balance does not change right after a payment | Data refreshes about 3 seconds after a transaction. The API cache lasts 30 seconds, and `?fresh=1` skips it. |
| Transaction fails with a gas error | The wallet needs USDC for gas, and the fixed max fee is 20 gwei in `chain/arc.ts`. |
| A user cannot be found | Lookups are case-insensitive but need an exact username, email or user ID. The recipient must have logged in at least once. |
| Camera scan does not start | Browsers only allow camera access on HTTPS (or `localhost`) and after the user grants permission. |
| Local API errors about the database | Run `npm run db:local` in `backend/` first. |

## 🚧 Known limitations

- **Two transactions per payment.** The wallet approves the exact amount, then calls the contract.
- **Explorer dependency.** Activity and invoice data come from the Arc explorer API, which sits behind bot protection. A dedicated indexer (for example Alchemy's Data API) would be more robust for production.
- **Contract logs are read one page at a time.** On a very busy contract, older invoices could stop resolving until pagination is added.
- **Activity is limited** to the 20 most recent USDC and EURC transfers per wallet, and requests to the 8 most recent.
- **Messages are public.** A memo is stored on-chain with the payment, so do not put private information in it.
- **Users must have logged in once** before they can be found by username, email or user ID. Anyone can still be paid by raw address.
- **Only Ethereum embedded wallets** are supported, and email is the only login method.

## 🔒 Security

- Private keys and secrets live only in gitignored files (`.env`, `.dev.vars`) and Worker secrets. Never commit them.
- The API never signs transactions. Users approve every payment in their own wallet.
- Approvals are for the exact payment amount, not unlimited.
- The deployer wallet receives all fees and can change the owner and allowed tokens. Use a dedicated wallet and store its key safely.
- To lock down CORS, set `FRONTEND_ORIGIN` in `wrangler.toml` to your site's URL.

> [!WARNING]
> The contract has not been through an external audit, and Arc is a live mainnet with real money. Start with small amounts.

> [!CAUTION]
> Never commit `contracts/.env`. It holds the deployer private key that controls the fee wallet.
- To lock down CORS, set `FRONTEND_ORIGIN` in `wrangler.toml` to your site's URL.

## 🤝 Contributing

1. Fork the repository and create a branch from `main`.
2. Keep changes small and focused, and remove any code you made unused.
3. Run the type checks, the web build and the contract tests.
4. Open a [pull request](https://github.com/observer-here/Cross-Way/pulls) that explains what changed and why.

Found a bug or have an idea? [Open an issue](https://github.com/observer-here/Cross-Way/issues).

## 🔗 Links

<div align="center">

[GitHub](https://github.com/observer-here/Cross-Way) ·
[Pull requests](https://github.com/observer-here/Cross-Way/pulls) ·
[Issues](https://github.com/observer-here/Cross-Way/issues) ·
[Arc Docs](https://docs.arc.io) ·
[Arc Explorer](https://explorer.arc.io) ·
[Circle Developer Docs](https://developers.circle.com) ·
[Privy Docs](https://docs.privy.io) ·
[Viem](https://viem.sh) ·
[Hardhat](https://hardhat.org) ·
[Cloudflare Workers](https://developers.cloudflare.com/workers) ·
[Cloudflare D1](https://developers.cloudflare.com/d1) ·
[Hono](https://hono.dev) ·
[Vercel](https://vercel.com/docs) ·
[X](https://x.com/circle)

Built on Arc by the Cross Way team.

</div>
