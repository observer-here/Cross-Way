<div align="center">

<img src="web/public/logo.png" alt="Cross Way" width="88" />

# Cross Way

**Send. Receive. Anyone. Anywhere.**

A stablecoin payments app on [Arc](https://docs.arc.io). Sign in with an email, get a wallet, and pay anyone by username, email, EVM address or user ID in USDC or EURC.

</div>

---

## Features

- **Email sign-in, no seed phrase.** Privy creates an embedded wallet on first login.
- **Send to anyone** using a username, email, EVM address or user ID, with a review step before confirming.
- **Payment requests** addressed to a specific payer, with an expiry of up to 90 days.
- **Payment links** that anyone can open and pay at `/pay/<id>`.
- **Real QR codes** with the app logo in the centre, plus a camera scanner that understands wallet addresses and payment links.
- **USDC and EURC** with live balances, recent activity, full history and a transaction detail page.
- **Profile** with a unique username (auto-assigned, editable), user ID and avatar.
- **Light and dark theme**, skeleton loaders, and a layout that holds up on narrow phones.
- **0.5% platform fee**, enforced by the contract and shown before every payment.

## Network

Cross Way runs on **Arc Mainnet**.

| | |
|---|---|
| Chain ID | `5042` |
| RPC | `https://rpc.mainnet.arc.io` |
| Explorer | [explorer.arc.io](https://explorer.arc.io) |
| Gas token | USDC (about 0.02 USDC to deploy the contract) |
| USDC | `0x3600000000000000000000000000000000000000` |
| EURC | `0xbEf5f6d51CB62b58e6A8f77868681825C6fe21c1` |
| CrossWay contract | [`0x7574a58077eDaC8B48FD7D07B1dB16b8FB347c84`](https://explorer.arc.io/address/0x7574a58077eDaC8B48FD7D07B1dB16b8FB347c84) |
| API | `https://crossway-api.dartajamul108.workers.dev` |

## Architecture

```
Browser (React + Vite) ──► Privy (login + embedded wallet)
        │
        ├──► Arc RPC ─────────► CrossWay contract (send, request, link, pay, cancel)
        │
        └──► Cloudflare Worker (Hono)
                  ├── D1 database ── users, usernames, avatars
                  ├── Arc RPC ────── token balances
                  └── Arc explorer API ── transfers, invoice events
```

- **Contracts** hold the payment logic. Funds move wallet to wallet through `transferFrom`; the contract never custodies tokens.
- **Backend** maps usernames, emails and user IDs to wallets, and serves wallet balances, activity and invoice data.
- **Web** signs every transaction in the user's own Privy wallet.

## Project structure

```
.
├── contracts/    Solidity contract, Hardhat config, tests, deploy script
├── backend/      Cloudflare Worker (Hono) with a D1 database
│   ├── migrations/
│   └── src/modules/{chain,users}
└── web/          React 19, Vite, Tailwind 4
    └── src/{pages,features,chain,auth,api,shared,lib}
```

## Smart contract

`contracts/src/CrossWay.sol` supports USDC and EURC, with an owner-managed allowlist for extra tokens.

| Function | What it does |
|---|---|
| `sendToAddress(to, token, amount, memo)` | Pay an address directly |
| `createRequest(payer, token, amount, expiresAt, memo)` | Ask a specific address to pay you |
| `createLink(token, amount, expiresAt, memo)` | Create an invoice anyone can pay |
| `pay(id, memo)` | Pay an invoice (the invoice is deleted afterwards) |
| `cancel(id)` | Payee cancels an open invoice |

Rules: fee is `FEE_BPS = 5` out of 1000 (0.5%) and goes to the owner, invoices expire within 90 days, native USDC sent straight to the contract is rejected, and the contract is reentrancy-guarded.

Events: `Paid`, `InvoiceCreated`, `InvoiceCancelled`.

## Backend API

All routes live under `/v1`.

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | none | Health check |
| GET | `/wallets/:addr` | none | Balances, recent activity and invoices (cached 30s, `?fresh=1` skips the cache) |
| GET | `/invoices/:id` | none | Invoice details |
| GET | `/tx/:hash/invoice-id` | none | Invoice ID created by a transaction |
| GET | `/lookup` | none | Resolve `q`, `email`, `username`, `userId` or `wallet` |
| GET | `/avatars/:id` | none | Profile picture |
| GET / POST / PATCH | `/me` | Privy token | Read, sync or update your profile |
| PUT | `/me/avatar` | Privy token | Upload an avatar |

## Getting started

Requirements: Node.js 20+, a [Privy](https://dashboard.privy.io) app, and a Cloudflare account.

```bash
git clone https://github.com/observer-here/Cross-Way.git
cd Cross-Way
```

### Contracts

```bash
cd contracts
npm install
npm test
```

To deploy, copy `.env.example` to `.env`, set `PRIVATE_KEY` (the wallet needs a little USDC for gas), then:

```bash
npm run deploy
```

### Backend

```bash
cd backend
npm install
cp .dev.vars.example .dev.vars      # set PRIVY_APP_ID and PRIVY_APP_SECRET
npm run db:local
npm run dev
```

Production:

```bash
npx wrangler d1 create crossway     # put the returned id in wrangler.toml
npm run db:remote
npx wrangler secret bulk .dev.vars
npm run deploy
```

Chain settings (`CONTRACT_ADDRESS`, `ARCSCAN_URL`, `RPC_URL`, `USDC`, `EURC`, `FEE_TO`) live in `backend/wrangler.toml`.

### Web

```bash
cd web
npm install
cp .env.example .env
npm run dev
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL |
| `VITE_PRIVY_APP_ID` | Privy app ID |

Chain constants and the contract address are in `web/src/chain/arc.ts`.

## Deployment

- **Backend:** `npm run deploy` in `backend/` publishes the Cloudflare Worker.
- **Web (Vercel):** root directory `web`, framework Vite, build `npm run build`, output `dist`, with both environment variables above. The app is a single-page app, so add a rewrite of every path to `/index.html`.
- **Privy:** add your site domain to the allowed origins in the Privy dashboard.

## Security notes

- `.env` and `.dev.vars` files are gitignored. Never commit private keys or the Privy app secret.
- The deployer key controls fee collection. Keep it separate from personal wallets and store it safely.
- Arc is a live mainnet, so test with small amounts first.

---

<div align="center">

### Links

[GitHub](https://github.com/observer-here/Cross-Way) ·
[Pull requests](https://github.com/observer-here/Cross-Way/pulls) ·
[Issues](https://github.com/observer-here/Cross-Way/issues) ·
[Arc Docs](https://docs.arc.io) ·
[Arc Explorer](https://explorer.arc.io) ·
[Circle Developer Docs](https://developers.circle.com) ·
[Privy Docs](https://docs.privy.io) ·
[Viem](https://viem.sh) ·
[Cloudflare Workers](https://developers.cloudflare.com/workers) ·
[Hono](https://hono.dev) ·
[X](https://x.com/circle)

Built on Arc by the Cross Way team.

</div>
