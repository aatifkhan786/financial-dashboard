# Personal Finance Dashboard

> Frontend Developer Intern Assignment

---

## Setup

```bash
npm install
npm run dev      # http://localhost:5174
```

---

## File Structure

```
src/
├── constants.js          ← Theme tokens + category registry + 65 seed transactions
├── utils.js              ← inr(), fmtDate(), groupByMonth(), uid()
├── App.jsx               ← Root: all shared state, layout, localStorage sync
├── main.jsx              ← React entry point
│
├── components/
│   ├── TopNav.jsx        ← Sticky top bar: logo, tabs, role switcher, theme toggle
│   ├── TxModal.jsx       ← Add / Edit transaction modal (Admin only)
│   └── Charts.jsx        ← TrendArea + SpendDonut + MonthBar (all in one file)
│
└── pages/
    ├── Overview.jsx      ← Bento grid: hero card, stat cards, charts, recent feed
    ├── Transactions.jsx  ← Monthly grouped timeline: search, filter, CRUD
    └── Insights.jsx      ← KPI cards, monthly bar chart, category progress bars
```

---

## Features

- **Dashboard** — Animated balance counter, savings rate ring, area trend + donut charts
- **Transactions** — Grouped by month, search + 3 filters, sort, CSV export
- **Insights** — 6 KPI cards, monthly bar chart, animated category progress bars
- **RBAC** — Admin: full CRUD, FAB, quick actions | Viewer: read-only banners, no edit controls
- **Dark / Light mode** — Violet-first palette, persisted in localStorage
- **Responsive** — Desktop top-nav tabs; mobile bottom tab bar
- **Animations** — CountUp numbers, fadeUp stagger, smooth transitions

---

## RBAC

Switch roles in the header dropdown. Changes are immediate on all pages.

| Feature | Admin | Viewer |
|---|---|---|
| View data | ✅ | ✅ |
| Export CSV | ✅ | ✅ |
| Add transaction | ✅ | ❌ |
| Edit / Delete | ✅ | ❌ |
| Floating FAB | ✅ | ❌ |
| Read-only banner | ❌ | ✅ |
| Quick Actions row | ✅ | ❌ |
| Header badge color | 👑 Amber | 👁 Blue |

---

## Reset Data

```
DevTools → Application → Local Storage → delete fiq2_txs
```
