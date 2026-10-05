# next-dashboard-template

Reusable Next.js dashboard starter with sales, team, orders and analytics views. Use it as a base for internal tools or sample admin panels.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn UI on Radix UI primitives
- Recharts 3 for charts
- HugeIcons + Lucide for icons
- date-fns for dates
- ESLint 9 with eslint-config-next

## Features

- Dashboard home with KPIs, sales trend, leaderboard and messages
- Products, transactions, reports and analytics
- Customers, channels, order management
- Team performance with search, filter, sort and pagination
- Campaigns, roles and permissions, billing, integrations
- Customer support, help center, system settings
- Shared shell with sidebar, mobile nav, theme toggle
- Dark mode support
- Mock data in `data/dashboard.json` and `data/mock.ts`

## Getting Started

Requirements: Node.js 20+, npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

```bash
npm run dev     # start dev server
npm run build   # production build
npm run start   # run production build
npm run lint    # run eslint
```

## Project Structure

```text
app/                  # routes (dashboard, team, orders, products, etc.)
  page.tsx            # dashboard home
  team/page.tsx       # team performance example
components/
  dashboard/          # shell, sidebar, cards, charts, tables, dialogs
  ui/                 # shadcn primitives
data/
  dashboard.json      # main dashboard seed data
  mock.ts             # generated lists (members, tickets, invoices, threads)
lib/                  # utilities (cn, formatting)
public/               # static assets
style-docs/           # UI pattern notes
```

## Customizing

- Sidebar links: `components/dashboard/sidebar.tsx:27`
- Current user and team: `data/dashboard.json:2`
- Team seed data: `data/mock.ts:281`
- Global styles and theme tokens: `app/globals.css`

## Conventions

- No emojis unless requested.
- No em dash. Use hyphen (-) or comma.
- Commits follow Conventional Commits, for example `feat(team): add member search`.
