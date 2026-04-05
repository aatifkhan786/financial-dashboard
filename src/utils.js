// ─────────────────────────────────────────────────────────────────────────────
// utils.js — Pure helper functions, no side effects, no React.
// ─────────────────────────────────────────────────────────────────────────────

// Format as Indian Rupees. compact=true gives "₹1.2L" style for chart axes.
export const inr = (n, compact = false) => {
  if (compact) {
    if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (Math.abs(n) >= 1000)   return `₹${(n / 1000).toFixed(0)}k`;
    return `₹${n}`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);
};

// "2025-01-15" → "15 Jan 2025"
export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

// "2025-01-15" → "Jan '25" — used on chart X-axis labels
export const monthLabel = (d) =>
  new Date(d).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

// Group sorted transactions by "Month YYYY" string.
// Returns an ordered object: { "November 2024": [...], "December 2024": [...] }
export const groupByMonth = (txs) => {
  const groups = {};
  [...txs]
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // newest first
    .forEach((tx) => {
      const key = new Date(tx.date).toLocaleDateString("en-IN", {
        month: "long", year: "numeric",
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });
  return groups;
};

// Simple collision-resistant ID for new transactions
export const uid = () =>
  `tx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
