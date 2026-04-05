/* ================================================================
   FINANCEIQ — Personal Finance Dashboard
   ----------------------------------------------------------------
   Tech    : React 18 + Recharts + Inline Styles
   Author  : Frontend Developer (Intern Assignment)
   Features: Overview · Transactions · Insights · RBAC
             Dark/Light Mode · LocalStorage · CSV Export
   ================================================================ */

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ─────────────────────────────────────────────────────────────────
// THEME TOKENS  — All design values in one place.
// Switching isDark flips the entire UI — no inline conditionals needed
// across every component since we pass `theme` as a prop.
// ─────────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg:           "#080B14",
    bgSecondary:  "#0F1220",
    surface:      "#131626",
    surfaceHover: "#1A1E30",
    border:       "rgba(255,255,255,0.06)",
    borderMed:    "rgba(255,255,255,0.13)",
    text:         "#F0F4FF",
    textSec:      "#8892A8",
    textMuted:    "#454E66",
    accent:       "#F59E0B",
    accentSoft:   "rgba(245,158,11,0.13)",
    green:        "#10B981",
    greenSoft:    "rgba(16,185,129,0.14)",
    red:          "#F87171",
    redSoft:      "rgba(248,113,113,0.14)",
    blue:         "#60A5FA",
    blueSoft:     "rgba(96,165,250,0.14)",
    purple:       "#A78BFA",
    purpleSoft:   "rgba(167,139,250,0.14)",
    grid:         "rgba(255,255,255,0.04)",
    axisText:     "#3D4560",
    isDark:       true,
  },
  light: {
    bg:           "#EEF2FF",
    bgSecondary:  "#E4E9FF",
    surface:      "#FFFFFF",
    surfaceHover: "#F5F7FF",
    border:       "rgba(0,0,0,0.07)",
    borderMed:    "rgba(0,0,0,0.14)",
    text:         "#0F172A",
    textSec:      "#4B5563",
    textMuted:    "#9CA3AF",
    accent:       "#D97706",
    accentSoft:   "rgba(217,119,6,0.10)",
    green:        "#059669",
    greenSoft:    "rgba(5,150,105,0.10)",
    red:          "#DC2626",
    redSoft:      "rgba(220,38,38,0.10)",
    blue:         "#2563EB",
    blueSoft:     "rgba(37,99,235,0.10)",
    purple:       "#7C3AED",
    purpleSoft:   "rgba(124,58,237,0.10)",
    grid:         "rgba(0,0,0,0.04)",
    axisText:     "#9CA3AF",
    isDark:       false,
  },
};

// ─────────────────────────────────────────────────────────────────
// CATEGORY REGISTRY  — Single source of truth for all categories.
// Each entry has a label, hex color, emoji icon, and type.
// ─────────────────────────────────────────────────────────────────
const CAT = {
  salary:        { label:"Salary",          color:"#10B981", icon:"💼", type:"income"  },
  freelance:     { label:"Freelance",        color:"#34D399", icon:"💻", type:"income"  },
  investment:    { label:"Investment",       color:"#84CC16", icon:"📈", type:"income"  },
  food:          { label:"Food & Dining",    color:"#F59E0B", icon:"🍔", type:"expense" },
  transport:     { label:"Transport",        color:"#3B82F6", icon:"🚗", type:"expense" },
  housing:       { label:"Housing",          color:"#8B5CF6", icon:"🏠", type:"expense" },
  entertainment: { label:"Entertainment",    color:"#EC4899", icon:"🎬", type:"expense" },
  healthcare:    { label:"Healthcare",       color:"#14B8A6", icon:"💊", type:"expense" },
  shopping:      { label:"Shopping",         color:"#F97316", icon:"🛍️", type:"expense" },
  utilities:     { label:"Utilities",        color:"#6366F1", icon:"⚡", type:"expense" },
};

// ─────────────────────────────────────────────────────────────────
// SEED DATA  — 6 months of realistic Indian-context transactions
// (Nov 2024 → Apr 2025). Used only when localStorage is empty.
// ─────────────────────────────────────────────────────────────────
const SEED = [
  // ── Nov 2024 ────────────────────────────────────────────────
  {id:"t001",date:"2024-11-01",description:"Monthly Salary",        category:"salary",       amount:85000,type:"income" },
  {id:"t002",date:"2024-11-03",description:"Zomato Order",           category:"food",         amount:450,  type:"expense"},
  {id:"t003",date:"2024-11-05",description:"Metro Card Recharge",    category:"transport",    amount:500,  type:"expense"},
  {id:"t004",date:"2024-11-07",description:"Netflix Subscription",   category:"entertainment",amount:649,  type:"expense"},
  {id:"t005",date:"2024-11-08",description:"Website Design Project", category:"freelance",    amount:25000,type:"income" },
  {id:"t006",date:"2024-11-10",description:"Monthly Groceries",      category:"food",         amount:3200, type:"expense"},
  {id:"t007",date:"2024-11-12",description:"Electricity Bill",       category:"utilities",    amount:1800, type:"expense"},
  {id:"t008",date:"2024-11-15",description:"Rent Payment",           category:"housing",      amount:22000,type:"expense"},
  {id:"t009",date:"2024-11-18",description:"Amazon Shopping",        category:"shopping",     amount:4500, type:"expense"},
  {id:"t010",date:"2024-11-20",description:"Doctor Consultation",    category:"healthcare",   amount:800,  type:"expense"},
  {id:"t011",date:"2024-11-22",description:"Mutual Fund SIP",        category:"investment",   amount:10000,type:"income" },
  {id:"t012",date:"2024-11-25",description:"Uber Rides",             category:"transport",    amount:1200, type:"expense"},
  {id:"t013",date:"2024-11-28",description:"Restaurant Dinner",      category:"food",         amount:2100, type:"expense"},
  // ── Dec 2024 ────────────────────────────────────────────────
  {id:"t014",date:"2024-12-01",description:"Monthly Salary",         category:"salary",       amount:85000,type:"income" },
  {id:"t015",date:"2024-12-03",description:"Christmas Shopping",     category:"shopping",     amount:8500, type:"expense"},
  {id:"t016",date:"2024-12-05",description:"Spotify Premium",        category:"entertainment",amount:119,  type:"expense"},
  {id:"t017",date:"2024-12-08",description:"Monthly Groceries",      category:"food",         amount:4100, type:"expense"},
  {id:"t018",date:"2024-12-10",description:"UI/UX Design Project",   category:"freelance",    amount:35000,type:"income" },
  {id:"t019",date:"2024-12-12",description:"Internet Bill",          category:"utilities",    amount:1499, type:"expense"},
  {id:"t020",date:"2024-12-15",description:"Rent Payment",           category:"housing",      amount:22000,type:"expense"},
  {id:"t021",date:"2024-12-18",description:"Movie Night",            category:"entertainment",amount:600,  type:"expense"},
  {id:"t022",date:"2024-12-20",description:"Pharmacy Medicines",     category:"healthcare",   amount:1200, type:"expense"},
  {id:"t023",date:"2024-12-22",description:"Mutual Fund SIP",        category:"investment",   amount:10000,type:"income" },
  {id:"t024",date:"2024-12-26",description:"New Year Party",         category:"entertainment",amount:3500, type:"expense"},
  {id:"t025",date:"2024-12-30",description:"Cab to Airport",         category:"transport",    amount:850,  type:"expense"},
  // ── Jan 2025 ────────────────────────────────────────────────
  {id:"t026",date:"2025-01-01",description:"Monthly Salary",         category:"salary",       amount:90000,type:"income" },
  {id:"t027",date:"2025-01-04",description:"Swiggy Order",           category:"food",         amount:520,  type:"expense"},
  {id:"t028",date:"2025-01-06",description:"Gym Membership",         category:"healthcare",   amount:2500, type:"expense"},
  {id:"t029",date:"2025-01-08",description:"Monthly Groceries",      category:"food",         amount:3500, type:"expense"},
  {id:"t030",date:"2025-01-10",description:"App Development Project",category:"freelance",    amount:45000,type:"income" },
  {id:"t031",date:"2025-01-12",description:"Electricity + Water",    category:"utilities",    amount:2200, type:"expense"},
  {id:"t032",date:"2025-01-15",description:"Rent Payment",           category:"housing",      amount:22000,type:"expense"},
  {id:"t033",date:"2025-01-18",description:"Myntra Sale Haul",       category:"shopping",     amount:5600, type:"expense"},
  {id:"t034",date:"2025-01-20",description:"Mutual Fund SIP",        category:"investment",   amount:15000,type:"income" },
  {id:"t035",date:"2025-01-24",description:"Metro + Auto Rides",     category:"transport",    amount:900,  type:"expense"},
  {id:"t036",date:"2025-01-28",description:"Cinema Tickets",         category:"entertainment",amount:750,  type:"expense"},
  // ── Feb 2025 ────────────────────────────────────────────────
  {id:"t037",date:"2025-02-01",description:"Monthly Salary",         category:"salary",       amount:90000,type:"income" },
  {id:"t038",date:"2025-02-03",description:"Valentine's Dinner",     category:"food",         amount:3800, type:"expense"},
  {id:"t039",date:"2025-02-05",description:"Udemy Courses",          category:"entertainment",amount:2500, type:"expense"},
  {id:"t040",date:"2025-02-07",description:"Monthly Groceries",      category:"food",         amount:3100, type:"expense"},
  {id:"t041",date:"2025-02-10",description:"Stock Dividends",        category:"investment",   amount:8000, type:"income" },
  {id:"t042",date:"2025-02-12",description:"Gas Bill",               category:"utilities",    amount:900,  type:"expense"},
  {id:"t043",date:"2025-02-15",description:"Rent Payment",           category:"housing",      amount:22000,type:"expense"},
  {id:"t044",date:"2025-02-18",description:"Freelance Design Work",  category:"freelance",    amount:20000,type:"income" },
  {id:"t045",date:"2025-02-20",description:"Medical Checkup",        category:"healthcare",   amount:1500, type:"expense"},
  {id:"t046",date:"2025-02-22",description:"Petrol",                 category:"transport",    amount:2000, type:"expense"},
  {id:"t047",date:"2025-02-25",description:"Mutual Fund SIP",        category:"investment",   amount:15000,type:"income" },
  // ── Mar 2025 ────────────────────────────────────────────────
  {id:"t048",date:"2025-03-01",description:"Monthly Salary",         category:"salary",       amount:90000,type:"income" },
  {id:"t049",date:"2025-03-04",description:"Holi Celebration",       category:"entertainment",amount:1500, type:"expense"},
  {id:"t050",date:"2025-03-06",description:"Monthly Groceries",      category:"food",         amount:3300, type:"expense"},
  {id:"t051",date:"2025-03-08",description:"Zomato + Swiggy",        category:"food",         amount:1800, type:"expense"},
  {id:"t052",date:"2025-03-10",description:"E-commerce Project",     category:"freelance",    amount:55000,type:"income" },
  {id:"t053",date:"2025-03-12",description:"Mobile Recharge",        category:"utilities",    amount:599,  type:"expense"},
  {id:"t054",date:"2025-03-15",description:"Rent Payment",           category:"housing",      amount:22000,type:"expense"},
  {id:"t055",date:"2025-03-18",description:"Laptop Accessories",     category:"shopping",     amount:7200, type:"expense"},
  {id:"t056",date:"2025-03-20",description:"Stock Market Gains",     category:"investment",   amount:12000,type:"income" },
  {id:"t057",date:"2025-03-22",description:"Petrol + Parking",       category:"transport",    amount:1600, type:"expense"},
  {id:"t058",date:"2025-03-25",description:"Mutual Fund SIP",        category:"investment",   amount:15000,type:"income" },
  {id:"t059",date:"2025-03-28",description:"IPL Tickets",            category:"entertainment",amount:4000, type:"expense"},
  // ── Apr 2025 ────────────────────────────────────────────────
  {id:"t060",date:"2025-04-01",description:"Monthly Salary",         category:"salary",       amount:90000,type:"income" },
  {id:"t061",date:"2025-04-03",description:"Monthly Groceries",      category:"food",         amount:3600, type:"expense"},
  {id:"t062",date:"2025-04-05",description:"Netflix + Prime Bundle", category:"entertainment",amount:1099, type:"expense"},
  {id:"t063",date:"2025-04-07",description:"Health Insurance",       category:"healthcare",   amount:5000, type:"expense"},
  {id:"t064",date:"2025-04-09",description:"SaaS Consulting",        category:"freelance",    amount:40000,type:"income" },
  {id:"t065",date:"2025-04-12",description:"Electricity Bill",       category:"utilities",    amount:1950, type:"expense"},
];

// ─────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────

// Format number as Indian Rupees with compact notation for charts
const inr = (n, compact = false) => {
  if (compact) {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}k`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);
};

// Format a YYYY-MM-DD date string into "02 Jan 2025"
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

// Get short "Jan '25" label for chart axes
const monthLabel = (d) =>
  new Date(d).toLocaleDateString("en-IN", { month:"short", year:"2-digit" });

// Unique ID for new transactions
const uid = () => `tx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;

// ─────────────────────────────────────────────────────────────────
// ICON COMPONENTS  — All SVGs inline; no external icon library needed
// ─────────────────────────────────────────────────────────────────
const Ico = ({ n, s = 18, c = "currentColor" }) => {
  const paths = {
    home:    <><rect x="3" y="3" w="7" h="7" rx="1.5"/><rect x="14" y="3" w="7" h="7" rx="1.5"/><rect x="3" y="14" w="7" h="7" rx="1.5"/><rect x="14" y="14" w="7" h="7" rx="1.5"/></>,
    list:    <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" w="6" h="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/></>,
    pulse:   <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
    sun:     <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    moon:    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>,
    plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    search:  <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    dl:      <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    edit:    <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash:   <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>,
    x:       <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    menu:    <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    up:      <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>,
    down:    <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[n]}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────
// CUSTOM RECHARTS TOOLTIP  — Themed to match dark/light mode
// ─────────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label, t }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.borderMed}`,
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
    }}>
      <div style={{ color: t.textSec, marginBottom: 8, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:7, marginBottom: i < payload.length-1 ? 4 : 0 }}>
          <span style={{ width:8, height:8, borderRadius:2, background:p.color, display:"inline-block", flexShrink:0 }}/>
          <span style={{ color:t.textSec }}>{p.name}:</span>
          <span style={{ fontWeight:700, color:t.text, marginLeft:"auto", paddingLeft:10 }}>{inr(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// SUMMARY CARD  — Used in Dashboard for key financial metrics
// ─────────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, badge, badgePositive, detail, icon, accent, accentSoft, t }) => (
  <div
    style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 16,
      padding: "20px 22px",
      position: "relative",
      overflow: "hidden",
      transition: "border-color 0.2s, transform 0.15s",
      cursor: "default",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = t.borderMed; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = t.border;    e.currentTarget.style.transform = "translateY(0)"; }}
  >
    {/* decorative bg circle */}
    <div style={{ position:"absolute", top:-16, right:-16, width:72, height:72, borderRadius:"50%", background:accentSoft, pointerEvents:"none" }}/>

    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
      {/* Icon pill */}
      <div style={{ width:44, height:44, borderRadius:12, background:accentSoft, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
        {icon}
      </div>
      {/* Badge */}
      {badge !== undefined && (
        <div style={{
          display:"flex", alignItems:"center", gap:3,
          fontSize:11, fontWeight:700,
          color: badgePositive ? t.green : t.red,
          background: badgePositive ? t.greenSoft : t.redSoft,
          padding:"3px 8px", borderRadius:20,
        }}>
          <Ico n={badgePositive ? "up" : "down"} s={9} c={badgePositive ? t.green : t.red}/>
          {Math.abs(badge)}%
        </div>
      )}
    </div>

    <div style={{ fontSize:12, color:t.textSec, marginBottom:5, fontWeight:500 }}>{label}</div>
    <div style={{ fontSize:22, fontWeight:800, color:t.text, letterSpacing:"-0.5px", lineHeight:1 }}>{inr(value)}</div>
    {detail && <div style={{ fontSize:11, color:t.textMuted, marginTop:5, lineHeight:1.5 }}>{detail}</div>}
  </div>
);

// ─────────────────────────────────────────────────────────────────
// TRANSACTION MODAL  — Add or Edit a transaction (Admin only).
// Includes client-side validation and a type toggle.
// ─────────────────────────────────────────────────────────────────
const TxModal = ({ tx, onSave, onClose, t }) => {
  const isEdit = !!tx?.id;

  // Pre-fill form if editing; default to an expense otherwise
  const [form, setForm] = useState({
    description: tx?.description || "",
    category:    tx?.category    || "food",
    amount:      tx?.amount      || "",
    date:        tx?.date        || new Date().toISOString().slice(0,10),
    type:        tx?.type        || "expense",
  });
  const [err, setErr] = useState({});

  // Only show categories matching the selected type
  const eligibleCats = Object.entries(CAT).filter(([,v]) => v.type === form.type);

  const validate = () => {
    const e = {};
    if (!form.description.trim())                          e.description = "Description is required";
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) e.amount = "Enter a valid positive amount";
    if (!form.date)                                        e.date = "Date is required";
    setErr(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ ...tx, ...form, amount: +form.amount, id: tx?.id || uid() });
  };

  // Switch type and reset category to first eligible option
  const switchType = (newType) => {
    const firstCat = Object.entries(CAT).find(([,v]) => v.type === newType)?.[0];
    setForm(f => ({ ...f, type: newType, category: firstCat || f.category }));
  };

  const inp = (field) => ({
    width:"100%", padding:"10px 13px", fontSize:13, fontFamily:"inherit",
    background: t.bgSecondary, border:`1px solid ${err[field] ? t.red : t.border}`,
    borderRadius:10, color:t.text, outline:"none", boxSizing:"border-box",
    transition:"border-color 0.2s",
  });

  return (
    // Dimmed backdrop — clicking outside closes modal
    <div
      style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.72)", display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(5px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background:t.surface, borderRadius:20, padding:26, width:"100%", maxWidth:468, border:`1px solid ${t.border}`, animation:"slideUp 0.2s ease" }}>

        {/* Modal header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:t.text }}>{isEdit ? "Edit Transaction" : "Add New Transaction"}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", padding:5, borderRadius:8, display:"flex" }}>
            <Ico n="x" s={17} c={t.textSec}/>
          </button>
        </div>

        {/* Income / Expense toggle */}
        <div style={{ display:"flex", background:t.bgSecondary, borderRadius:12, padding:4, marginBottom:18, border:`1px solid ${t.border}` }}>
          {["expense","income"].map(tp => (
            <button key={tp} onClick={() => switchType(tp)} style={{
              flex:1, padding:"8px 0", borderRadius:8, fontSize:13, fontWeight:700,
              border:"none", cursor:"pointer", transition:"all 0.2s", fontFamily:"inherit",
              background: form.type === tp ? (tp==="income" ? t.green : t.red) : "transparent",
              color: form.type === tp ? "#fff" : t.textSec,
            }}>
              {tp === "income" ? "⬆ Income" : "⬇ Expense"}
            </button>
          ))}
        </div>

        {/* Form fields */}
        <div style={{ display:"flex", flexDirection:"column", gap:13 }}>

          {/* Description */}
          <div>
            <label style={{ display:"block", fontSize:11, color:t.textSec, marginBottom:5, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Description</label>
            <input value={form.description} placeholder="e.g. Monthly Groceries"
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={inp("description")}
              onFocus={e => e.target.style.borderColor = t.borderMed}
              onBlur={e  => e.target.style.borderColor = err.description ? t.red : t.border}
            />
            {err.description && <p style={{ color:t.red, fontSize:11, marginTop:4 }}>{err.description}</p>}
          </div>

          {/* Amount + Date — side by side */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ display:"block", fontSize:11, color:t.textSec, marginBottom:5, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Amount (₹)</label>
              <input type="number" min="1" value={form.amount} placeholder="0"
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                style={inp("amount")}
                onFocus={e => e.target.style.borderColor = t.borderMed}
                onBlur={e  => e.target.style.borderColor = err.amount ? t.red : t.border}
              />
              {err.amount && <p style={{ color:t.red, fontSize:11, marginTop:4 }}>{err.amount}</p>}
            </div>
            <div>
              <label style={{ display:"block", fontSize:11, color:t.textSec, marginBottom:5, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Date</label>
              <input type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={inp("date")}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={{ display:"block", fontSize:11, color:t.textSec, marginBottom:5, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              style={{ ...inp("category"), appearance:"none", cursor:"pointer" }}>
              {eligibleCats.map(([k,v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display:"flex", gap:10, marginTop:22 }}>
          <button onClick={onClose} style={{
            flex:1, padding:"11px 0", borderRadius:11, fontSize:13, fontWeight:700,
            border:`1px solid ${t.border}`, background:"transparent", color:t.textSec, cursor:"pointer", fontFamily:"inherit",
          }}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={{
            flex:2, padding:"11px 0", borderRadius:11, fontSize:13, fontWeight:800,
            border:"none", background:t.accent, color:"#000", cursor:"pointer", fontFamily:"inherit",
          }}>
            {isEdit ? "Save Changes" : "Add Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// DASHBOARD PAGE  — Overview with summary cards + two charts
// ─────────────────────────────────────────────────────────────────
const Dashboard = ({ txs, t }) => {

  // Aggregate totals across all transactions
  const totalIncome   = useMemo(() => txs.filter(x => x.type==="income" ).reduce((s,x)=>s+x.amount,0), [txs]);
  const totalExpenses = useMemo(() => txs.filter(x => x.type==="expense").reduce((s,x)=>s+x.amount,0), [txs]);
  const balance       = totalIncome - totalExpenses;
  const savingsRate   = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  // Monthly data for the Area chart
  const monthly = useMemo(() => {
    const map = {};
    txs.forEach(x => {
      const k = monthLabel(x.date);
      if (!map[k]) map[k] = { month:k, income:0, expense:0 };
      map[k][x.type === "income" ? "income" : "expense"] += x.amount;
    });
    return Object.values(map).map(m => ({ ...m, balance: m.income - m.expense }));
  }, [txs]);

  // Category data for the Donut chart (expense only)
  const byCategory = useMemo(() => {
    const map = {};
    txs.filter(x => x.type==="expense").forEach(x => {
      map[x.category] = (map[x.category]||0) + x.amount;
    });
    return Object.entries(map)
      .map(([k,v]) => ({ name: CAT[k]?.label||k, value:v, color: CAT[k]?.color||"#888" }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 6);
  }, [txs]);
  const catTotal = byCategory.reduce((s,c)=>s+c.value, 0);

  return (
    <div style={{ padding:"22px", display:"flex", flexDirection:"column", gap:18 }}>

      {/* ── Summary Cards ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(185px, 1fr))", gap:14 }}>
        <SummaryCard label="Total Balance"  value={balance}       badge={savingsRate} badgePositive={balance>0}  detail={`${savingsRate}% savings rate`}     icon="💰" accent={t.accent} accentSoft={t.accentSoft} t={t}/>
        <SummaryCard label="Total Income"   value={totalIncome}   badge={12}          badgePositive              detail="vs previous period"                  icon="📥" accent={t.green}  accentSoft={t.greenSoft}  t={t}/>
        <SummaryCard label="Total Expenses" value={totalExpenses} badge={8}           badgePositive={false}      detail="vs previous period"                  icon="📤" accent={t.red}    accentSoft={t.redSoft}    t={t}/>
        <SummaryCard label="Net Savings"    value={balance}       badge={savingsRate} badgePositive={savingsRate>=20} detail={savingsRate>=20?"Above 20% goal ✅":"Below 20% goal ⚠️"} icon="🏦" accent={t.blue} accentSoft={t.blueSoft} t={t}/>
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1.7fr 1fr", gap:14 }}>

        {/* Area chart — Balance Trend */}
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:"20px 18px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
            <div>
              <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:t.text }}>Balance Trend</h3>
              <p style={{ margin:"3px 0 0", fontSize:11, color:t.textMuted }}>6-month financial overview</p>
            </div>
            <div style={{ display:"flex", gap:10, fontSize:11 }}>
              {[{c:t.green,l:"Income"},{c:t.red,l:"Expenses"},{c:t.accent,l:"Net"}].map(x=>(
                <span key={x.l} style={{ display:"flex", alignItems:"center", gap:4, color:t.textSec }}>
                  <span style={{ width:8, height:8, borderRadius:2, background:x.c }}/>
                  {x.l}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={monthly} margin={{ top:4, right:4, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={t.green} stopOpacity={0.28}/>
                  <stop offset="95%" stopColor={t.green} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={t.red} stopOpacity={0.28}/>
                  <stop offset="95%" stopColor={t.red} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false}/>
              <XAxis dataKey="month" tick={{ fill:t.axisText, fontSize:10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:t.axisText, fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>inr(v,true)} width={52}/>
              <Tooltip content={<ChartTip t={t}/>}/>
              <Area type="monotone" dataKey="income"  name="Income"   stroke={t.green} strokeWidth={2} fill="url(#gI)"/>
              <Area type="monotone" dataKey="expense" name="Expenses" stroke={t.red}   strokeWidth={2} fill="url(#gE)"/>
              <Area type="monotone" dataKey="balance" name="Net"      stroke={t.accent} strokeWidth={2.2} fill="none" strokeDasharray="5 3"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart — Spending Breakdown */}
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:"20px 18px" }}>
          <h3 style={{ margin:"0 0 4px", fontSize:14, fontWeight:700, color:t.text }}>Spending Breakdown</h3>
          <p style={{ margin:"0 0 12px", fontSize:11, color:t.textMuted }}>By category</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={byCategory} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">
                {byCategory.map((c,i) => <Cell key={i} fill={c.color}/>)}
              </Pie>
              <Tooltip formatter={v=>[inr(v),"Spent"]} contentStyle={{ background:t.surface, border:`1px solid ${t.borderMed}`, borderRadius:8, fontSize:12, color:t.text }}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:4 }}>
            {byCategory.slice(0,5).map(c => (
              <div key={c.name} style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ width:8, height:8, borderRadius:2, background:c.color, flexShrink:0 }}/>
                <span style={{ fontSize:11, color:t.textSec, flex:1, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{c.name}</span>
                <span style={{ fontSize:11, fontWeight:700, color:t.text }}>{Math.round(c.value/catTotal*100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Transactions mini-list ── */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:"20px 18px" }}>
        <h3 style={{ margin:"0 0 14px", fontSize:14, fontWeight:700, color:t.text }}>Recent Transactions</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
          {[...txs].reverse().slice(0,6).map(x => {
            const cat = CAT[x.category];
            return (
              <div key={x.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 10px", borderRadius:10, transition:"background 0.12s" }}
                onMouseEnter={e => e.currentTarget.style.background = t.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ fontSize:18, width:32, textAlign:"center", flexShrink:0 }}>{cat?.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:t.text, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{x.description}</div>
                  <div style={{ fontSize:11, color:t.textMuted }}>{fmtDate(x.date)} · {cat?.label}</div>
                </div>
                <div style={{ fontSize:13, fontWeight:800, color: x.type==="income" ? t.green : t.red, flexShrink:0 }}>
                  {x.type==="income" ? "+" : "−"}{inr(x.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// TRANSACTIONS PAGE  — Full table with search, filter, sort & CRUD
// ─────────────────────────────────────────────────────────────────
const Transactions = ({ txs, setTxs, role, t }) => {
  const isAdmin = role === "admin";

  const [search,       setSearch]       = useState("");
  const [filterType,   setFilterType]   = useState("all");
  const [filterCat,    setFilterCat]    = useState("all");
  const [filterMonth,  setFilterMonth]  = useState("all");
  const [sortBy,       setSortBy]       = useState("date");
  const [sortDir,      setSortDir]      = useState("desc");
  const [modal,        setModal]        = useState(null); // null | { tx: null|object }

  // Derive unique month options from current transactions
  const monthOptions = useMemo(() => {
    const s = new Set(txs.map(x => x.date.slice(0,7)));
    return [...s].sort().reverse();
  }, [txs]);

  // Apply filters + sort in one memoised pass
  const visible = useMemo(() => {
    let r = [...txs];
    if (search)           { const q = search.toLowerCase(); r = r.filter(x => x.description.toLowerCase().includes(q) || CAT[x.category]?.label.toLowerCase().includes(q)); }
    if (filterType!=="all")  r = r.filter(x => x.type     === filterType);
    if (filterCat!=="all")   r = r.filter(x => x.category === filterCat);
    if (filterMonth!=="all") r = r.filter(x => x.date.startsWith(filterMonth));
    r.sort((a,b) => {
      const cmp =
        sortBy==="date"        ? new Date(a.date) - new Date(b.date) :
        sortBy==="amount"      ? a.amount - b.amount :
        sortBy==="description" ? a.description.localeCompare(b.description) : 0;
      return sortDir==="asc" ? cmp : -cmp;
    });
    return r;
  }, [txs, search, filterType, filterCat, filterMonth, sortBy, sortDir]);

  const toggleSort = (col) => {
    sortBy === col ? setSortDir(d => d==="asc"?"desc":"asc") : (setSortBy(col), setSortDir("desc"));
  };

  const saveTransaction = useCallback((tx) => {
    setTxs(prev => prev.some(x => x.id===tx.id) ? prev.map(x => x.id===tx.id ? tx : x) : [...prev, tx]);
    setModal(null);
  }, [setTxs]);

  const deleteTx = useCallback((id) => {
    if (window.confirm("Delete this transaction? This cannot be undone."))
      setTxs(prev => prev.filter(x => x.id !== id));
  }, [setTxs]);

  const exportCSV = () => {
    const rows = [["Date","Description","Category","Type","Amount (INR)"]].concat(
      visible.map(x => [x.date, `"${x.description}"`, CAT[x.category]?.label, x.type, x.amount])
    );
    const blob = new Blob([rows.map(r=>r.join(",")).join("\n")], { type:"text/csv" });
    Object.assign(document.createElement("a"), { href:URL.createObjectURL(blob), download:"transactions.csv" }).click();
  };

  // Quick stats for the stats bar above table
  const statsIncome  = visible.filter(x=>x.type==="income" ).reduce((s,x)=>s+x.amount,0);
  const statsExpense = visible.filter(x=>x.type==="expense").reduce((s,x)=>s+x.amount,0);

  const SortHeader = ({ col, label }) => {
    const active = sortBy === col;
    return (
      <button onClick={() => toggleSort(col)} style={{ background:"none", border:"none", cursor:"pointer", color:active?t.accent:t.textSec, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", gap:3, padding:0, fontFamily:"inherit", textTransform:"uppercase", letterSpacing:"0.06em" }}>
        {label} {active && <Ico n={sortDir==="asc"?"up":"down"} s={10} c={t.accent}/>}
      </button>
    );
  };

  const selectStyle = { background:t.bgSecondary, border:`1px solid ${t.border}`, borderRadius:10, padding:"8px 12px", color:t.text, fontSize:12, outline:"none", cursor:"pointer", fontFamily:"inherit" };

  return (
    <div style={{ padding:"22px", display:"flex", flexDirection:"column", gap:14 }}>

      {/* ── Toolbar ── */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:14, padding:"14px 16px", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>

        {/* Search box */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:"1 1 180px", background:t.bgSecondary, borderRadius:10, padding:"8px 12px", border:`1px solid ${t.border}` }}>
          <Ico n="search" s={14} c={t.textMuted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search transactions…"
            style={{ border:"none", background:"transparent", outline:"none", fontSize:12, color:t.text, flex:1, fontFamily:"inherit" }}/>
        </div>

        {/* Filters */}
        <select value={filterType}  onChange={e=>setFilterType(e.target.value)}  style={selectStyle}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select value={filterCat}   onChange={e=>setFilterCat(e.target.value)}   style={selectStyle}>
          <option value="all">All Categories</option>
          {Object.entries(CAT).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>

        <select value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} style={selectStyle}>
          <option value="all">All Months</option>
          {monthOptions.map(m => <option key={m} value={m}>{new Date(m+"-01").toLocaleDateString("en-IN",{month:"long",year:"numeric"})}</option>)}
        </select>

        <div style={{ flex:1 }}/>

        {/* Export CSV */}
        <button onClick={exportCSV} style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:`1px solid ${t.border}`, borderRadius:10, padding:"8px 14px", color:t.textSec, fontSize:12, cursor:"pointer", fontWeight:600, fontFamily:"inherit" }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=t.borderMed}
          onMouseLeave={e=>e.currentTarget.style.borderColor=t.border}>
          <Ico n="dl" s={13} c={t.textSec}/> Export CSV
        </button>

        {/* Add Transaction — Admin only */}
        {isAdmin && (
          <button onClick={() => setModal({ tx:null })} style={{ display:"flex", alignItems:"center", gap:6, background:t.accent, border:"none", borderRadius:10, padding:"8px 16px", color:"#000", fontSize:12, cursor:"pointer", fontWeight:800, fontFamily:"inherit" }}>
            <Ico n="plus" s={13} c="#000"/> Add Transaction
          </button>
        )}
      </div>

      {/* ── Stats bar ── */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        {[
          { label:`${visible.length} Results`, color:t.textSec },
          { label:`Income: ${inr(statsIncome)}`,  color:t.green },
          { label:`Expenses: ${inr(statsExpense)}`, color:t.red },
          { label:`Net: ${inr(statsIncome - statsExpense)}`, color:(statsIncome - statsExpense) >= 0 ? t.accent : t.red },
        ].map(s => (
          <span key={s.label} style={{ fontSize:11, fontWeight:700, color:s.color, background:t.surface, border:`1px solid ${t.border}`, padding:"4px 12px", borderRadius:20 }}>{s.label}</span>
        ))}
        {/* Viewer notice */}
        {!isAdmin && (
          <span style={{ fontSize:11, fontWeight:600, color:t.accent, background:t.accentSoft, border:`1px solid ${t.accent}22`, padding:"4px 12px", borderRadius:20 }}>
            👁 Viewer mode — switch to Admin to manage transactions
          </span>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, overflow:"hidden" }}>

        {/* Table header */}
        <div style={{
          display:"grid",
          gridTemplateColumns: isAdmin ? "100px 1fr 140px 80px 130px 90px" : "100px 1fr 140px 80px 130px",
          padding:"11px 18px",
          borderBottom:`1px solid ${t.border}`,
          background: t.isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
        }}>
          <SortHeader col="date"        label="Date"/>
          <SortHeader col="description" label="Description"/>
          <span style={{ fontSize:11, fontWeight:700, color:t.textSec, textTransform:"uppercase", letterSpacing:"0.06em" }}>Category</span>
          <span style={{ fontSize:11, fontWeight:700, color:t.textSec, textTransform:"uppercase", letterSpacing:"0.06em" }}>Type</span>
          <SortHeader col="amount"      label="Amount"/>
          {isAdmin && <span style={{ fontSize:11, fontWeight:700, color:t.textSec, textTransform:"uppercase", letterSpacing:"0.06em" }}>Actions</span>}
        </div>

        {/* Empty state */}
        {visible.length === 0 && (
          <div style={{ padding:"56px 24px", textAlign:"center", color:t.textMuted }}>
            <div style={{ fontSize:38, marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:15, fontWeight:700, color:t.textSec, marginBottom:6 }}>No transactions found</div>
            <div style={{ fontSize:12 }}>Try adjusting your search or filter criteria.</div>
          </div>
        )}

        {/* Rows */}
        {visible.map((x, i) => {
          const cat = CAT[x.category];
          return (
            <div key={x.id} style={{
              display:"grid",
              gridTemplateColumns: isAdmin ? "100px 1fr 140px 80px 130px 90px" : "100px 1fr 140px 80px 130px",
              padding:"12px 18px", alignItems:"center",
              borderBottom: i < visible.length-1 ? `1px solid ${t.border}` : "none",
              transition:"background 0.1s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = t.surfaceHover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

              <span style={{ fontSize:11, color:t.textSec }}>{fmtDate(x.date)}</span>
              <span style={{ fontSize:13, color:t.text, fontWeight:600, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", paddingRight:16 }}>{x.description}</span>

              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:15 }}>{cat?.icon}</span>
                <span style={{ fontSize:11, color:t.textSec, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{cat?.label}</span>
              </div>

              <span style={{
                fontSize:10, fontWeight:800, padding:"3px 8px", borderRadius:20, width:"fit-content",
                background: x.type==="income" ? t.greenSoft : t.redSoft,
                color:      x.type==="income" ? t.green     : t.red,
                textTransform:"uppercase", letterSpacing:"0.05em",
              }}>
                {x.type}
              </span>

              <span style={{ fontSize:13, fontWeight:800, color: x.type==="income" ? t.green : t.red }}>
                {x.type==="income" ? "+" : "−"}{inr(x.amount)}
              </span>

              {isAdmin && (
                <div style={{ display:"flex", gap:6 }}>
                  {/* Edit */}
                  <button onClick={() => setModal({ tx:x })} style={{ background:"none", border:`1px solid ${t.border}`, borderRadius:8, padding:"5px 7px", cursor:"pointer", display:"flex", transition:"border-color 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=t.blue}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=t.border}>
                    <Ico n="edit" s={12} c={t.blue}/>
                  </button>
                  {/* Delete */}
                  <button onClick={() => deleteTx(x.id)} style={{ background:"none", border:`1px solid ${t.border}`, borderRadius:8, padding:"5px 7px", cursor:"pointer", display:"flex", transition:"border-color 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=t.red}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=t.border}>
                    <Ico n="trash" s={12} c={t.red}/>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Render modal when open */}
      {modal && <TxModal tx={modal.tx} onSave={saveTransaction} onClose={() => setModal(null)} t={t}/>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// INSIGHTS PAGE  — Analytics, insights cards & category analysis
// ─────────────────────────────────────────────────────────────────
const Insights = ({ txs, t }) => {

  // Monthly aggregates for the bar chart
  const monthly = useMemo(() => {
    const map = {};
    txs.forEach(x => {
      const k = monthLabel(x.date);
      if (!map[k]) map[k] = { month:k, income:0, expense:0 };
      map[k][x.type==="income"?"income":"expense"] += x.amount;
    });
    return Object.values(map).map(m => ({ ...m, net: m.income - m.expense }));
  }, [txs]);

  // Category spending totals
  const catSpend = useMemo(() => {
    const map = {};
    txs.filter(x=>x.type==="expense").forEach(x => { map[x.category] = (map[x.category]||0) + x.amount; });
    return Object.entries(map)
      .map(([k,v]) => ({ key:k, amount:v, ...CAT[k] }))
      .sort((a,b) => b.amount - a.amount);
  }, [txs]);
  const catTotal = catSpend.reduce((s,c) => s+c.amount, 0);

  // Derived stats for insight cards
  const totalIncome = txs.filter(x=>x.type==="income" ).reduce((s,x)=>s+x.amount,0);
  const totalExp    = txs.filter(x=>x.type==="expense").reduce((s,x)=>s+x.amount,0);
  const savingsRate = totalIncome > 0 ? Math.round((totalIncome-totalExp)/totalIncome*100) : 0;
  const months      = monthly.length || 1;
  const momChange   = monthly.length >= 2
    ? +((monthly.at(-1).expense - monthly.at(-2).expense) / (monthly.at(-2).expense||1) * 100).toFixed(1)
    : 0;

  const cards = [
    {
      icon:"🏆", title:"Top Spending Category", badge: null,
      value: catSpend[0]?.label || "—",
      detail: catSpend[0] ? `${inr(catSpend[0].amount)} · ${Math.round(catSpend[0].amount/catTotal*100)}% of expenses` : "No data",
      col: t.red, bg: t.redSoft,
    },
    {
      icon:"💡", title:"Monthly Savings Rate",
      value: `${savingsRate}%`,
      detail: savingsRate >= 20 ? "✅ Exceeds 20% benchmark" : "⚠️ Aim for ≥ 20% savings",
      col: savingsRate >= 20 ? t.green : t.accent, bg: savingsRate >= 20 ? t.greenSoft : t.accentSoft,
    },
    {
      icon:"📊", title:"Expense Change (MoM)",
      value: `${momChange > 0 ? "+" : ""}${momChange}%`,
      detail: momChange > 0 ? "Spending rose vs last month" : "Spending fell vs last month",
      col: momChange > 0 ? t.red : t.green, bg: momChange > 0 ? t.redSoft : t.greenSoft,
    },
    {
      icon:"🎯", title:"Least Spent Category",
      value: catSpend.at(-1)?.label || "—",
      detail: catSpend.at(-1) ? `Only ${inr(catSpend.at(-1).amount)} spent` : "No data",
      col: t.blue, bg: t.blueSoft,
    },
    {
      icon:"📥", title:"Avg Monthly Income",
      value: inr(Math.round(totalIncome/months)),
      detail: `Across ${months} months`,
      col: t.green, bg: t.greenSoft,
    },
    {
      icon:"📤", title:"Avg Monthly Expenses",
      value: inr(Math.round(totalExp/months)),
      detail: `Across ${months} months`,
      col: t.purple, bg: t.purpleSoft,
    },
  ];

  return (
    <div style={{ padding:"22px", display:"flex", flexDirection:"column", gap:18 }}>

      {/* ── Insight Cards ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(210px, 1fr))", gap:13 }}>
        {cards.map(c => (
          <div key={c.title} style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:14, padding:"18px 20px", borderLeft:`3px solid ${c.col}` }}>
            <div style={{ fontSize:26, marginBottom:10 }}>{c.icon}</div>
            <div style={{ fontSize:11, color:t.textSec, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>{c.title}</div>
            <div style={{ fontSize:20, fontWeight:800, color:c.col, marginBottom:5, lineHeight:1 }}>{c.value}</div>
            <div style={{ fontSize:11, color:t.textMuted, lineHeight:1.6 }}>{c.detail}</div>
          </div>
        ))}
      </div>

      {/* ── Monthly Comparison Bar Chart ── */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:"20px 18px" }}>
        <div style={{ marginBottom:16 }}>
          <h3 style={{ margin:"0 0 4px", fontSize:14, fontWeight:700, color:t.text }}>Monthly Income vs Expenses</h3>
          <p style={{ margin:0, fontSize:11, color:t.textMuted }}>Side-by-side monthly comparison</p>
        </div>
        <div style={{ display:"flex", gap:12, marginBottom:14, fontSize:11 }}>
          {[{c:t.green,l:"Income"},{c:t.red,l:"Expenses"},{c:t.accent,l:"Net Savings"}].map(x=>(
            <span key={x.l} style={{ display:"flex", alignItems:"center", gap:4, color:t.textSec }}>
              <span style={{ width:9, height:9, borderRadius:2, background:x.c }}/>
              {x.l}
            </span>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={monthly} margin={{ top:4, right:4, left:0, bottom:0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false}/>
            <XAxis dataKey="month" tick={{ fill:t.axisText, fontSize:10 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:t.axisText, fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>inr(v,true)} width={52}/>
            <Tooltip content={<ChartTip t={t}/>}/>
            <Bar dataKey="income"  name="Income"   fill={t.green}  radius={[4,4,0,0]} fillOpacity={0.88} barSize={22}/>
            <Bar dataKey="expense" name="Expenses" fill={t.red}    radius={[4,4,0,0]} fillOpacity={0.88} barSize={22}/>
            <Bar dataKey="net"     name="Net"      fill={t.accent} radius={[4,4,0,0]} fillOpacity={0.75} barSize={22}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Category Breakdown Progress Bars ── */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:"20px 18px" }}>
        <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:t.text }}>Category Spending Analysis</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {catSpend.map(c => {
            const pct = catTotal > 0 ? Math.round(c.amount / catTotal * 100) : 0;
            return (
              <div key={c.key}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:17 }}>{c.icon}</span>
                    <span style={{ fontSize:13, fontWeight:600, color:t.text }}>{c.label}</span>
                  </div>
                  <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                    <span style={{ fontSize:11, color:t.textMuted }}>{pct}%</span>
                    <span style={{ fontSize:13, fontWeight:800, color:t.text, minWidth:80, textAlign:"right" }}>{inr(c.amount)}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height:5, borderRadius:3, background:t.border, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:3, background:c.color, width:`${pct}%`, transition:"width 0.7s ease" }}/>
                </div>
              </div>
            );
          })}
          {catSpend.length === 0 && (
            <div style={{ textAlign:"center", padding:"32px 0", color:t.textMuted, fontSize:13 }}>No expense data available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// ROOT APP COMPONENT  — Wires together layout, routing, state & persistence
// ─────────────────────────────────────────────────────────────────
export default function App() {

  // ── Persistent state (localStorage) ──────────────────────────
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("fiq_theme") !== "light"; } catch { return true; }
  });
  const [role, setRole] = useState(() => {
    try { return localStorage.getItem("fiq_role") || "admin"; } catch { return "admin"; }
  });
  const [txs, setTxs] = useState(() => {
    try { const s = localStorage.getItem("fiq_txs"); return s ? JSON.parse(s) : SEED; }
    catch { return SEED; }
  });

  // ── UI state ──────────────────────────────────────────────────
  const [page,        setPage]        = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile,    setIsMobile]    = useState(typeof window !== "undefined" && window.innerWidth < 768);

  const t = isDark ? THEMES.dark : THEMES.light;
  const SIDEBAR_W = 230;

  // Persist on every change
  useEffect(() => { try { localStorage.setItem("fiq_theme", isDark?"dark":"light"); } catch {} }, [isDark]);
  useEffect(() => { try { localStorage.setItem("fiq_role",  role); } catch {} }, [role]);
  useEffect(() => { try { localStorage.setItem("fiq_txs",   JSON.stringify(txs)); } catch {} }, [txs]);

  // Responsive breakpoint listener
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Inject Google Font + global keyframes once on mount
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.25); border-radius: 4px; }
      @keyframes slideUp { from { transform:translateY(14px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    `;
    document.head.appendChild(style);
  }, []);

  // ── Navigation items ─────────────────────────────────────────
  const NAV = [
    { id:"dashboard",    label:"Dashboard",    icon:"home" },
    { id:"transactions", label:"Transactions", icon:"list" },
    { id:"insights",     label:"Insights",     icon:"pulse"},
  ];

  // ── Shared sidebar inner content ─────────────────────────────
  const SidebarContent = () => (
    <>
      {/* Logo / Brand */}
      <div style={{ padding:"22px 18px 16px", borderBottom:`1px solid ${t.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:38, height:38, borderRadius:11,
            background:`linear-gradient(135deg, ${t.accent} 0%, #E8A000 100%)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:20, fontWeight:900, color:"#000", flexShrink:0,
            boxShadow:`0 4px 14px ${t.accentSoft}`,
          }}>₹</div>
          <div>
            <div style={{ fontSize:16, fontWeight:900, color:t.text, letterSpacing:"-0.4px" }}>FinanceIQ</div>
            <div style={{ fontSize:10, color:t.textMuted, fontWeight:500, marginTop:1 }}>Personal Dashboard</div>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav style={{ flex:1, padding:"14px 10px", display:"flex", flexDirection:"column", gap:3 }}>
        <div style={{ fontSize:9, fontWeight:800, color:t.textMuted, padding:"2px 10px 6px", letterSpacing:"0.12em", textTransform:"uppercase" }}>Navigation</div>
        {NAV.map(item => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => { setPage(item.id); setSidebarOpen(false); }} style={{
              display:"flex", alignItems:"center", gap:11, padding:"10px 14px", borderRadius:10,
              cursor:"pointer", border:"none", textAlign:"left", width:"100%",
              background:  active ? t.accentSoft : "transparent",
              color:       active ? t.accent : t.textSec,
              fontWeight:  active ? 700 : 400,
              fontSize:    14, fontFamily:"inherit",
              transition:  "background 0.15s, color 0.15s",
            }}
              onMouseEnter={e => !active && (e.currentTarget.style.background = t.surfaceHover)}
              onMouseLeave={e => !active && (e.currentTarget.style.background = "transparent")}
            >
              <Ico n={item.icon} s={16} c={active ? t.accent : t.textSec}/>
              {item.label}
              {active && <div style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:t.accent, flexShrink:0 }}/>}
            </button>
          );
        })}
      </nav>

      {/* Bottom tip card */}
      <div style={{ padding:"12px 10px 14px", borderTop:`1px solid ${t.border}` }}>
        <div style={{ padding:"11px 13px", borderRadius:11, background:t.accentSoft, border:`1px solid ${t.borderMed}` }}>
          <div style={{ fontSize:11, fontWeight:700, color:t.accent, marginBottom:3 }}>💡 Quick Tip</div>
          <div style={{ fontSize:10, color:t.textSec, lineHeight:1.7 }}>
            {role === "viewer"
              ? "Switch to Admin role to add, edit, and delete transactions."
              : "You have full Admin access. Add or manage transactions freely."}
          </div>
        </div>
      </div>
    </>
  );

  const pageInfo = { dashboard:{title:"Dashboard",sub:"Your financial overview"}, transactions:{title:"Transactions",sub:"Manage your money flow"}, insights:{title:"Insights",sub:"Understand your spending"} };

  return (
    <div style={{
      minHeight: "100vh",
      background: t.bg,
      color: t.text,
      fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex",
    }}>

      {/* ── Desktop Sidebar (always visible ≥ 768px) ── */}
      {!isMobile && (
        <div style={{ width:SIDEBAR_W, flexShrink:0 }}>
          <div style={{
            position:"fixed", top:0, left:0, width:SIDEBAR_W, height:"100vh",
            background:t.surface, borderRight:`1px solid ${t.border}`,
            display:"flex", flexDirection:"column", zIndex:200,
          }}>
            <SidebarContent/>
          </div>
        </div>
      )}

      {/* ── Mobile Sidebar (slide-in overlay) ── */}
      {isMobile && sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} style={{ position:"fixed", inset:0, zIndex:199, background:"rgba(0,0,0,0.65)", backdropFilter:"blur(4px)" }}/>
          <div style={{
            position:"fixed", top:0, left:0, width:SIDEBAR_W, height:"100vh",
            background:t.surface, borderRight:`1px solid ${t.border}`,
            zIndex:200, display:"flex", flexDirection:"column",
            animation:"slideUp 0.2s ease",
          }}>
            {/* Close button in mobile sidebar */}
            <button onClick={() => setSidebarOpen(false)} style={{
              position:"absolute", top:14, right:14, background:"none", border:"none", cursor:"pointer",
              padding:6, borderRadius:8, zIndex:1,
            }}>
              <Ico n="x" s={17} c={t.textSec}/>
            </button>
            <SidebarContent/>
          </div>
        </>
      )}

      {/* ── Main Content Column ── */}
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>

        {/* ── Sticky Header ── */}
        <header style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"13px 22px", gap:10,
          borderBottom:`1px solid ${t.border}`,
          background:t.surface,
          position:"sticky", top:0, zIndex:100,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {/* Hamburger on mobile */}
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:5, borderRadius:8, display:"flex" }}>
                <Ico n="menu" s={20} c={t.textSec}/>
              </button>
            )}
            <div>
              <h1 style={{ margin:0, fontSize:17, fontWeight:800, color:t.text, letterSpacing:"-0.3px" }}>{pageInfo[page]?.title}</h1>
              <p style={{ margin:0, fontSize:11, color:t.textMuted }}>{pageInfo[page]?.sub}</p>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8 }}>

            {/* Role Selector */}
            <div style={{ display:"flex", alignItems:"center", gap:6, background:t.surfaceHover, border:`1px solid ${t.border}`, borderRadius:10, padding:"6px 10px" }}>
              <span style={{ fontSize:10, color:t.textMuted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>Role</span>
              <select value={role} onChange={e => setRole(e.target.value)} style={{ background:"transparent", border:"none", color:t.text, fontSize:12, fontWeight:800, cursor:"pointer", outline:"none", fontFamily:"inherit" }}>
                <option value="admin">👑 Admin</option>
                <option value="viewer">👁 Viewer</option>
              </select>
            </div>

            {/* Theme Toggle */}
            <button onClick={() => setIsDark(d=>!d)} title="Toggle dark/light mode" style={{ background:t.surfaceHover, border:`1px solid ${t.border}`, borderRadius:10, padding:"7px 9px", cursor:"pointer", display:"flex", alignItems:"center" }}>
              <Ico n={isDark ? "sun" : "moon"} s={16} c={t.accent}/>
            </button>

            {/* User Avatar */}
            <div style={{
              width:34, height:34, borderRadius:9,
              background:`linear-gradient(135deg, ${t.accent}, ${t.blue})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, fontWeight:900, color:"#000", flexShrink:0, userSelect:"none",
            }}>
              {role === "admin" ? "AD" : "VW"}
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main style={{ flex:1, overflowY:"auto" }}>
          {page === "dashboard"    && <Dashboard txs={txs} t={t}/>}
          {page === "transactions" && <Transactions txs={txs} setTxs={setTxs} role={role} t={t}/>}
          {page === "insights"     && <Insights txs={txs} t={t}/>}
        </main>
      </div>
    </div>
  );
}