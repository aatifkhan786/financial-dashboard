// ─────────────────────────────────────────────────────────────────────────────
// constants.js — Theme tokens + Category registry + Mock transaction data
// Keeping all static config in one file so imports stay clean everywhere else.
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. THEME TOKENS ──────────────────────────────────────────────────────────
// Violet-first palette. Pass `t` (active theme) down as a prop —
// switching isDark is one state change and the whole UI re-themes.

export const THEMES = {
  dark: {
    bg:           "#07080F",       // deepest background
    bgAlt:        "#0B0D16",       // slightly lighter page bg
    surface:      "#0E1018",       // card background
    surfaceUp:    "#141720",       // raised / hover surface
    surfaceHover: "#1A1E2C",       // row hover

    border:       "rgba(255,255,255,0.07)",
    borderMed:    "rgba(255,255,255,0.13)",

    text:         "#ECEEFF",
    textSec:      "#727B9E",
    textMuted:    "#353C58",

    // Brand — violet
    accent:       "#7C6FFF",
    accentHover:  "#9589FF",
    accentSoft:   "rgba(124,111,255,0.14)",
    accentGlow:   "rgba(124,111,255,0.08)",

    // Semantic
    green:        "#00D97E",
    greenSoft:    "rgba(0,217,126,0.13)",
    red:          "#FF5A5A",
    redSoft:      "rgba(255,90,90,0.13)",
    amber:        "#FFB547",
    amberSoft:    "rgba(255,181,71,0.13)",
    blue:         "#4DA8FF",
    blueSoft:     "rgba(77,168,255,0.13)",
    teal:         "#00D9C8",
    tealSoft:     "rgba(0,217,200,0.13)",
    pink:         "#FF6EC7",
    pinkSoft:     "rgba(255,110,199,0.13)",

    grid:         "rgba(255,255,255,0.04)",
    axis:         "#1C2038",
    isDark:       true,
  },
  light: {
    bg:           "#EEF0FF",
    bgAlt:        "#E6E9FF",
    surface:      "#FFFFFF",
    surfaceUp:    "#F5F6FF",
    surfaceHover: "#F0F2FF",

    border:       "rgba(0,0,0,0.07)",
    borderMed:    "rgba(0,0,0,0.14)",

    text:         "#09091C",
    textSec:      "#44496A",
    textMuted:    "#9CA3C0",

    accent:       "#5B4FD4",
    accentHover:  "#7064E8",
    accentSoft:   "rgba(91,79,212,0.10)",
    accentGlow:   "rgba(91,79,212,0.05)",

    green:        "#009959",
    greenSoft:    "rgba(0,153,89,0.10)",
    red:          "#D43333",
    redSoft:      "rgba(212,51,51,0.10)",
    amber:        "#C47D0E",
    amberSoft:    "rgba(196,125,14,0.10)",
    blue:         "#1A62C4",
    blueSoft:     "rgba(26,98,196,0.10)",
    teal:         "#008F85",
    tealSoft:     "rgba(0,143,133,0.10)",
    pink:         "#B83393",
    pinkSoft:     "rgba(184,51,147,0.10)",

    grid:         "rgba(0,0,0,0.04)",
    axis:         "#C8CEEA",
    isDark:       false,
  },
};

// ── 2. CATEGORY REGISTRY ─────────────────────────────────────────────────────
// label, hex color for charts, emoji, and type ("income" | "expense").

export const CAT = {
  salary:        { label: "Salary",        color: "#00D97E", icon: "💼", type: "income"  },
  freelance:     { label: "Freelance",      color: "#00D9C8", icon: "💻", type: "income"  },
  investment:    { label: "Investment",     color: "#4DA8FF", icon: "📈", type: "income"  },
  housing:       { label: "Housing",        color: "#7C6FFF", icon: "🏠", type: "expense" },
  food:          { label: "Food & Dining",  color: "#FFB547", icon: "🍔", type: "expense" },
  transport:     { label: "Transport",      color: "#4DA8FF", icon: "🚗", type: "expense" },
  shopping:      { label: "Shopping",       color: "#FF6EC7", icon: "🛍️", type: "expense" },
  entertainment: { label: "Entertainment",  color: "#FF8C42", icon: "🎬", type: "expense" },
  healthcare:    { label: "Healthcare",     color: "#00D9C8", icon: "💊", type: "expense" },
  utilities:     { label: "Utilities",      color: "#9B90FF", icon: "⚡", type: "expense" },
};

// ── 3. SEED TRANSACTIONS ─────────────────────────────────────────────────────
// 65 realistic Indian-context entries (Nov 2024 → Apr 2025).
// Only used on first load — localStorage takes over after that.

export const SEED = [
  // ── Nov 2024 ───────────────────────────────────────────────────────────────
  { id:"t001", date:"2024-11-01", description:"Monthly Salary",         category:"salary",       amount:85000, type:"income"  },
  { id:"t002", date:"2024-11-03", description:"Zomato Order",            category:"food",         amount:450,   type:"expense" },
  { id:"t003", date:"2024-11-05", description:"Metro Card Recharge",     category:"transport",    amount:500,   type:"expense" },
  { id:"t004", date:"2024-11-07", description:"Netflix Subscription",    category:"entertainment",amount:649,   type:"expense" },
  { id:"t005", date:"2024-11-08", description:"Website Design Project",  category:"freelance",    amount:25000, type:"income"  },
  { id:"t006", date:"2024-11-10", description:"Monthly Groceries",       category:"food",         amount:3200,  type:"expense" },
  { id:"t007", date:"2024-11-12", description:"Electricity Bill",        category:"utilities",    amount:1800,  type:"expense" },
  { id:"t008", date:"2024-11-15", description:"Rent Payment",            category:"housing",      amount:22000, type:"expense" },
  { id:"t009", date:"2024-11-18", description:"Amazon Shopping",         category:"shopping",     amount:4500,  type:"expense" },
  { id:"t010", date:"2024-11-20", description:"Doctor Consultation",     category:"healthcare",   amount:800,   type:"expense" },
  { id:"t011", date:"2024-11-22", description:"Mutual Fund SIP",         category:"investment",   amount:10000, type:"income"  },
  { id:"t012", date:"2024-11-25", description:"Uber Rides",              category:"transport",    amount:1200,  type:"expense" },
  { id:"t013", date:"2024-11-28", description:"Restaurant Dinner",       category:"food",         amount:2100,  type:"expense" },
  // ── Dec 2024 ───────────────────────────────────────────────────────────────
  { id:"t014", date:"2024-12-01", description:"Monthly Salary",          category:"salary",       amount:85000, type:"income"  },
  { id:"t015", date:"2024-12-03", description:"Christmas Shopping",      category:"shopping",     amount:8500,  type:"expense" },
  { id:"t016", date:"2024-12-05", description:"Spotify Premium",         category:"entertainment",amount:119,   type:"expense" },
  { id:"t017", date:"2024-12-08", description:"Monthly Groceries",       category:"food",         amount:4100,  type:"expense" },
  { id:"t018", date:"2024-12-10", description:"UI/UX Design Project",    category:"freelance",    amount:35000, type:"income"  },
  { id:"t019", date:"2024-12-12", description:"Internet Bill",           category:"utilities",    amount:1499,  type:"expense" },
  { id:"t020", date:"2024-12-15", description:"Rent Payment",            category:"housing",      amount:22000, type:"expense" },
  { id:"t021", date:"2024-12-18", description:"Movie Night",             category:"entertainment",amount:600,   type:"expense" },
  { id:"t022", date:"2024-12-20", description:"Pharmacy Medicines",      category:"healthcare",   amount:1200,  type:"expense" },
  { id:"t023", date:"2024-12-22", description:"Mutual Fund SIP",         category:"investment",   amount:10000, type:"income"  },
  { id:"t024", date:"2024-12-26", description:"New Year Party",          category:"entertainment",amount:3500,  type:"expense" },
  { id:"t025", date:"2024-12-30", description:"Cab to Airport",          category:"transport",    amount:850,   type:"expense" },
  // ── Jan 2025 ───────────────────────────────────────────────────────────────
  { id:"t026", date:"2025-01-01", description:"Monthly Salary",          category:"salary",       amount:90000, type:"income"  },
  { id:"t027", date:"2025-01-04", description:"Swiggy Order",            category:"food",         amount:520,   type:"expense" },
  { id:"t028", date:"2025-01-06", description:"Gym Membership",          category:"healthcare",   amount:2500,  type:"expense" },
  { id:"t029", date:"2025-01-08", description:"Monthly Groceries",       category:"food",         amount:3500,  type:"expense" },
  { id:"t030", date:"2025-01-10", description:"App Development Project", category:"freelance",    amount:45000, type:"income"  },
  { id:"t031", date:"2025-01-12", description:"Electricity + Water",     category:"utilities",    amount:2200,  type:"expense" },
  { id:"t032", date:"2025-01-15", description:"Rent Payment",            category:"housing",      amount:22000, type:"expense" },
  { id:"t033", date:"2025-01-18", description:"Myntra Sale Haul",        category:"shopping",     amount:5600,  type:"expense" },
  { id:"t034", date:"2025-01-20", description:"Mutual Fund SIP",         category:"investment",   amount:15000, type:"income"  },
  { id:"t035", date:"2025-01-24", description:"Metro + Auto Rides",      category:"transport",    amount:900,   type:"expense" },
  { id:"t036", date:"2025-01-28", description:"Cinema Tickets",          category:"entertainment",amount:750,   type:"expense" },
  // ── Feb 2025 ───────────────────────────────────────────────────────────────
  { id:"t037", date:"2025-02-01", description:"Monthly Salary",          category:"salary",       amount:90000, type:"income"  },
  { id:"t038", date:"2025-02-03", description:"Valentine's Dinner",      category:"food",         amount:3800,  type:"expense" },
  { id:"t039", date:"2025-02-05", description:"Udemy Courses",           category:"entertainment",amount:2500,  type:"expense" },
  { id:"t040", date:"2025-02-07", description:"Monthly Groceries",       category:"food",         amount:3100,  type:"expense" },
  { id:"t041", date:"2025-02-10", description:"Stock Dividends",         category:"investment",   amount:8000,  type:"income"  },
  { id:"t042", date:"2025-02-12", description:"Gas Bill",                category:"utilities",    amount:900,   type:"expense" },
  { id:"t043", date:"2025-02-15", description:"Rent Payment",            category:"housing",      amount:22000, type:"expense" },
  { id:"t044", date:"2025-02-18", description:"Freelance Design Work",   category:"freelance",    amount:20000, type:"income"  },
  { id:"t045", date:"2025-02-20", description:"Medical Checkup",         category:"healthcare",   amount:1500,  type:"expense" },
  { id:"t046", date:"2025-02-22", description:"Petrol",                  category:"transport",    amount:2000,  type:"expense" },
  { id:"t047", date:"2025-02-25", description:"Mutual Fund SIP",         category:"investment",   amount:15000, type:"income"  },
  // ── Mar 2025 ───────────────────────────────────────────────────────────────
  { id:"t048", date:"2025-03-01", description:"Monthly Salary",          category:"salary",       amount:90000, type:"income"  },
  { id:"t049", date:"2025-03-04", description:"Holi Celebration",        category:"entertainment",amount:1500,  type:"expense" },
  { id:"t050", date:"2025-03-06", description:"Monthly Groceries",       category:"food",         amount:3300,  type:"expense" },
  { id:"t051", date:"2025-03-08", description:"Zomato + Swiggy",         category:"food",         amount:1800,  type:"expense" },
  { id:"t052", date:"2025-03-10", description:"E-commerce Project",      category:"freelance",    amount:55000, type:"income"  },
  { id:"t053", date:"2025-03-12", description:"Mobile Recharge",         category:"utilities",    amount:599,   type:"expense" },
  { id:"t054", date:"2025-03-15", description:"Rent Payment",            category:"housing",      amount:22000, type:"expense" },
  { id:"t055", date:"2025-03-18", description:"Laptop Accessories",      category:"shopping",     amount:7200,  type:"expense" },
  { id:"t056", date:"2025-03-20", description:"Stock Market Gains",      category:"investment",   amount:12000, type:"income"  },
  { id:"t057", date:"2025-03-22", description:"Petrol + Parking",        category:"transport",    amount:1600,  type:"expense" },
  { id:"t058", date:"2025-03-25", description:"Mutual Fund SIP",         category:"investment",   amount:15000, type:"income"  },
  { id:"t059", date:"2025-03-28", description:"IPL Tickets",             category:"entertainment",amount:4000,  type:"expense" },
  // ── Apr 2025 ───────────────────────────────────────────────────────────────
  { id:"t060", date:"2025-04-01", description:"Monthly Salary",          category:"salary",       amount:90000, type:"income"  },
  { id:"t061", date:"2025-04-03", description:"Monthly Groceries",       category:"food",         amount:3600,  type:"expense" },
  { id:"t062", date:"2025-04-05", description:"Netflix + Prime Bundle",  category:"entertainment",amount:1099,  type:"expense" },
  { id:"t063", date:"2025-04-07", description:"Health Insurance",        category:"healthcare",   amount:5000,  type:"expense" },
  { id:"t064", date:"2025-04-09", description:"SaaS Consulting",         category:"freelance",    amount:40000, type:"income"  },
  { id:"t065", date:"2025-04-12", description:"Electricity Bill",        category:"utilities",    amount:1950,  type:"expense" },
];
