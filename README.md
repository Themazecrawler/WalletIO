# WalletIO

WalletIO is a highly secure, modern digital crypto wallet application built with React. It provides a stunning, animated user interface for managing digital assets, performing transfers, and monitoring the market, all while enforcing robust security protocols like Biometric authentication and 2FA.

## Features

- **Crypto Vault & Dashboard**: Monitor your portfolio value, view individual crypto balances in real-time, and track your recent transactions.
- **Secure Authentication**: Multi-layered (simulated) authentication flow including Email/Password, Social Logins (Google/Apple), and Biometric (Face ID / Touch ID) unlocks, plus a two-factor verification gate for sign-in and sensitive actions.
- **Transfers & Ledger**: Send and receive crypto assets with seamless QR code scanning and a fully searchable, filterable transaction ledger.
- **Market Terminal**: Trade assets dynamically with live-simulated liquidity cash balances.
- **Security Hub**: Toggle Two-Factor Authentication (2FA) and Biometric unlocking, requiring authorizations for sensitive actions.
- **Export Capabilities**: Export your secure audit ledger to a CSV file.
- **Premium Aesthetics**: Built with Tailwind CSS, GSAP, and Motion for a fluid, glassmorphic, and dynamic user experience.

## Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Animations**: GSAP, Motion
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites
Make sure you have Node.js and a package manager like `npm`, `yarn`, `pnpm`, or `bun` installed.

### Installation

1. Clone the repository and navigate to the project folder:
   ```bash
   cd WalletIO
   ```

2. Install the dependencies:
   ```bash
   npm install
   # or yarn / pnpm / bun install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:3000`.

## Scripts

- `npm run dev`: Starts the local Vite development server.
- `npm run build`: Bundles the application for production.
- `npm run preview`: Previews the production build locally.
- `npm run typecheck`: Type-checks the project with `tsc --noEmit`.
- `npm run lint`: Runs ESLint (TypeScript + React Hooks rules).
- `npm run test`: Runs the vitest + Testing Library suite.
- `npm run clean`: Cleans up the `dist` folder.

> **Note on identity & auth**: This is a front-end demo — all authentication, biometrics, 2FA, balances, and Web3 wallet connections are simulated in the browser (versioned `localStorage`). Nothing is sent to a server, and no credentials are stored or verified. Treat it as a UI showcase, not a production wallet.

> **Git hooks**: The repo ships a commit-msg guard in `scripts/git-hooks` that strips auto-generated attribution lines. Enable it in any fresh clone with:
> ```bash
> git config core.hooksPath scripts/git-hooks
> ```

Live app : https://walletio.webflow.io/
