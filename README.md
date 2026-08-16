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

## Presentation: preview mockup vs full-screen app

The phone mockup (status bar, notch, "WalletIO OS v1.42" footer) is **preview chrome only** — it renders in `npm run dev` so the demo looks like a handset. A real deployment renders the app edge-to-edge:

- **Native builds** (Capacitor below): always full-screen — the OS provides the status bar, and the layout respects `env(safe-area-inset-*)`.
- **Production web**: full-screen by default. To keep the phone mockup on a web demo, set `VITE_DEVICE_FRAME=1` (or append `?frame=1` to the URL); `VITE_DEVICE_FRAME=0` / `?frame=0` forces full-screen.

## Mobile build (Capacitor)

Wrap the web app into real iOS/Android shells with Capacitor (already a dependency):

```bash
npm run build
npx cap add ios      # once
npx cap add android  # once
npx cap sync
npx cap open ios     # or: npx cap open android
```

`capacitor.config.ts` points at the `dist` build output (`appId: com.walletio.app`, `appName: WalletIO`). The app auto-detects the native runtime and switches off the mock frame.

## Going live (optional real backend)

The app ships with optional Supabase and Sentry integrations that activate automatically when credentials are present — without them everything keeps running in simulated demo mode.

1. Create a free Supabase project and a Sentry project.
2. Copy `.env.example` to `.env` and fill in:
   ```bash
   VITE_SUPABASE_URL="https://<project-ref>.supabase.co"
   VITE_SUPABASE_ANON_KEY="<your-anon-key>"
   VITE_SENTRY_DSN="https://<key>@o<org>.ingest.sentry.io/<project>"
   ```
3. Apply the database migration so balances live server-side (see below).
4. Restart the dev server. Email/password sign-in, sign-up, password reset, and sign-out now call Supabase Auth (server-side password verification, real accounts); the error boundary reports crashes to Sentry.

Still simulated for now: TOTP 2FA (the in-app 2FA gate is a local stand-in) and real Web3 wallet connections.

### Server-authoritative balances (RLS)

When a Supabase session is live, balances stop being `localStorage` play money and are enforced by the server:

1. Run the migration in a Supabase CLI project (`supabase db push`) or paste `supabase/migrations/20260816000000_wallet_balances.sql` into the SQL editor.
2. On every sign-in the app hydrates balances from the `wallet_balances` table (RLS: users can only read their own rows).
3. Every transfer, vault deposit/withdraw, and market swap is applied through the `walletio_apply_movement` RPC — a security-definer function that applies the delta atomically and rejects any movement that would take a balance below zero. The UI then updates from the **server-confirmed** balance.
4. Transactions are appended to `ledger_entries` (RLS insert with check), so the history is preserved server-side too.

New accounts are seeded with the starter portfolio by a trigger on `auth.users`. Editing `localStorage` can no longer mint money: the server is the source of truth and re-asserts itself on every load. Without credentials (or before a session exists) the app falls back to the simulated local store unchanged.

> **CSP on production hosting**: the production build embeds a strict Content-Security-Policy via a `<meta>` tag. The build auto-widens `connect-src` with the Supabase project origin and Sentry ingest origin from the env vars set at build time, so auth calls and error telemetry are not blocked in production. `frame-ancestors` (clickjacking protection) is only honored when the policy is sent as an HTTP response header — add the full policy to your host's header config, e.g.:
> ```
> Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https://lh3.googleusercontent.com; connect-src 'self' https://<project-ref>.supabase.co https://o<org>.ingest.sentry.io; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
> ```

> **CSP on production hosting**: the production build embeds a strict Content-Security-Policy via a `<meta>` tag, but `frame-ancestors` (clickjacking protection) is only honored when the policy is sent as an HTTP response header. Add the full policy to your host's header config, e.g.:
> ```
> Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https://lh3.googleusercontent.com; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
> ```

> **Git hooks**: The repo ships a commit-msg guard in `scripts/git-hooks` that strips auto-generated attribution lines. Enable it in any fresh clone with:
> ```bash
> git config core.hooksPath scripts/git-hooks
> ```

Live app : https://walletio.webflow.io/
