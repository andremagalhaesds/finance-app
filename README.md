# Finance App

A personal, local-first web app to track income and expenses, view your balance, and project the next 6 or 12 months.

## Requirements

- [Node.js](https://nodejs.org/)

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Open on your phone (same Wi‑Fi)

1. Keep your PC and phone on the **same Wi‑Fi network**.
2. On your PC, in the project folder:

```bash
npm run dev:mobile
```

3. In the terminal, find the **Network** line — e.g. `http://192.168.1.10:5173/`.
4. On your phone, open Chrome/Safari and enter that address (use **your** PC’s IP, not the example).

**Find your IP on Windows** (if the terminal does not show Network):

```bash
ipconfig
```

Use the Wi‑Fi **IPv4 Address** (e.g. `192.168.0.15`). On your phone: `http://192.168.0.15:5173`

**Firewall:** Windows may ask to allow Node on first run — allow on **private** networks.

**Data:** entries on your phone stay in the phone’s browser; entries on your PC stay on the PC (they are separate).

To test the production build on your network (no hot reload):

```bash
npm run build
npm run preview:mobile
```

## Features

- **Entries**: forms, separate income and expense tables, balance summary.
- **Projection**: 6- or 12-month table with filters by type (income/expense) and category.
- **Two forms**: one for income, one for expenses.
- **Two tables**: income (positive) and expenses (negative), kept separate.
- **Categories**: housing, food, salary, etc. (UI labels in Portuguese).
- **Fixed vs variable**: fixed items repeat every month in projections; variable items count only in the month of the date you set.
- **Projection columns**: fixed/variable income and expenses per month.
- **Storage**: `localStorage` in the browser — no server, no account.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on PC (localhost) |
| `npm run dev:mobile` | Dev server reachable on your LAN IP |
| `npm run build` | Build static assets to `dist/` |
| `npm run preview` | Preview build on PC |
| `npm run preview:mobile` | Preview build on your LAN IP |

## Stack

- TypeScript + Vite
- Tailwind CSS
- No React, no backend
