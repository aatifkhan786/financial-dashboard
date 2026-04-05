// ─── Category Registry ───────────────────────────────────────────────────────
// Each category: label, chart color (hex), emoji icon, and type.
// Colors chosen for contrast against both dark and light backgrounds.
// ─────────────────────────────────────────────────────────────────────────────

export const CAT = {
  // Income sources
  salary:        { label: "Salary",        color: "#00D97E", icon: "💼", type: "income"  },
  freelance:     { label: "Freelance",      color: "#00D9C8", icon: "💻", type: "income"  },
  investment:    { label: "Investment",     color: "#4DA8FF", icon: "📈", type: "income"  },

  // Expense categories
  housing:       { label: "Housing",        color: "#7C6FFF", icon: "🏠", type: "expense" },
  food:          { label: "Food & Dining",  color: "#FFB547", icon: "🍔", type: "expense" },
  transport:     { label: "Transport",      color: "#4DA8FF", icon: "🚗", type: "expense" },
  shopping:      { label: "Shopping",       color: "#FF6EC7", icon: "🛍️", type: "expense" },
  entertainment: { label: "Entertainment",  color: "#FF8C42", icon: "🎬", type: "expense" },
  healthcare:    { label: "Healthcare",     color: "#00D9C8", icon: "💊", type: "expense" },
  utilities:     { label: "Utilities",      color: "#9B90FF", icon: "⚡", type: "expense" },
};

// Ordered list for UI filters (expenses only)
export const EXPENSE_CATS = Object.entries(CAT)
  .filter(([, v]) => v.type === "expense")
  .map(([k, v]) => ({ key: k, ...v }));

export const INCOME_CATS = Object.entries(CAT)
  .filter(([, v]) => v.type === "income")
  .map(([k, v]) => ({ key: k, ...v }));
