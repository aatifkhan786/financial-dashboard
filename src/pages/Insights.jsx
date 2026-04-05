// ─────────────────────────────────────────────────────────────────────────────
// Insights.jsx — Analytics page. Read-only for both roles (no CRUD here).
// Shows KPI cards, monthly bar chart, and category spending analysis.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { MonthBar } from "../components/Charts";
import { CAT } from "../constants";
import { inr, monthLabel } from "../utils";

export default function Insights({ txs, t }) {

  // ── Monthly aggregates for bar chart ─────────────────────────────────────
  const monthly = useMemo(() => {
    const map = {};
    txs.forEach((x) => {
      const k = monthLabel(x.date);
      if (!map[k]) map[k] = { month: k, income: 0, expense: 0 };
      map[k][x.type === "income" ? "income" : "expense"] += x.amount;
    });
    return Object.values(map).map((m) => ({ ...m, net: m.income - m.expense }));
  }, [txs]);

  // ── Category spending totals (expenses only) ──────────────────────────────
  const catSpend = useMemo(() => {
    const map = {};
    txs.filter((x) => x.type === "expense").forEach((x) => {
      map[x.category] = (map[x.category] || 0) + x.amount;
    });
    return Object.entries(map)
      .map(([k, v]) => ({ key: k, amount: v, ...CAT[k] }))
      .sort((a, b) => b.amount - a.amount);
  }, [txs]);
  const catTotal = catSpend.reduce((s, c) => s + c.amount, 0);

  // ── Top-level stats ───────────────────────────────────────────────────────
  const totalIncome = txs.filter((x) => x.type === "income" ).reduce((s, x) => s + x.amount, 0);
  const totalExp    = txs.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExp) / totalIncome) * 100) : 0;
  const months      = monthly.length || 1;

  // Month-over-month expense change (last two months)
  const momChange = monthly.length >= 2
    ? +((monthly.at(-1).expense - monthly.at(-2).expense) / (monthly.at(-2).expense || 1) * 100).toFixed(1)
    : 0;

  // Best month = highest net savings
  const bestMonth = monthly.reduce((best, m) => m.net > (best?.net ?? -Infinity) ? m : best, null);

  // ── KPI card data ─────────────────────────────────────────────────────────
  const kpis = [
    {
      icon: "🏆", label: "Top Spending Category",
      value: catSpend[0]?.label || "—",
      detail: catSpend[0] ? `${inr(catSpend[0].amount)} · ${Math.round((catSpend[0].amount / catTotal) * 100)}% of expenses` : "No data",
      color: t.red,
    },
    {
      icon: "💡", label: "Savings Rate",
      value: `${savingsRate}%`,
      detail: savingsRate >= 20 ? "✅ Above 20% benchmark" : "⚠️ Target ≥ 20%",
      color: savingsRate >= 20 ? t.green : t.amber,
    },
    {
      icon: "📉", label: "Expense Change MoM",
      value: `${momChange > 0 ? "+" : ""}${momChange}%`,
      detail: momChange > 0 ? "Spending rose vs last month" : "Spending fell vs last month",
      color: momChange > 0 ? t.red : t.green,
    },
    {
      icon: "⭐", label: "Best Month",
      value: bestMonth?.month || "—",
      detail: bestMonth ? `Net: ${inr(bestMonth.net)}` : "—",
      color: t.accent,
    },
    {
      icon: "📥", label: "Avg Monthly Income",
      value: inr(Math.round(totalIncome / months)),
      detail: `Across ${months} months`,
      color: t.green,
    },
    {
      icon: "📤", label: "Avg Monthly Expenses",
      value: inr(Math.round(totalExp / months)),
      detail: `Across ${months} months`,
      color: t.teal,
    },
  ];

  return (
    <div style={{ padding: "16px", maxWidth: 1000, margin: "0 auto" }}>

      {/* ── KPI Cards grid ───────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12, marginBottom: 14,
      }}>
        {kpis.map((k, i) => (
          <div key={k.label} style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 13, padding: "16px 16px",
            borderLeft: `3px solid ${k.color}`,
            animation: `fadeUp 0.4s ease ${i * 60}ms both`,
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 10, color: t.textSec, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
              {k.label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: k.color, marginBottom: 4, lineHeight: 1 }}>
              {k.value}
            </div>
            <div style={{ fontSize: 10, color: t.textMuted, lineHeight: 1.6 }}>{k.detail}</div>
          </div>
        ))}
      </div>

      {/* ── Monthly Bar Chart ────────────────────────────────────────────── */}
      <div style={{
        background: t.surface, border: `1px solid ${t.border}`,
        borderRadius: 14, padding: "16px 14px", marginBottom: 14,
        animation: "fadeUp 0.4s ease 0.1s both",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: t.text }}>Monthly Comparison</div>
            <div style={{ fontSize: 10, color: t.textMuted }}>Income vs Expenses per month</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ c: "#00D97E", l: "Income" }, { c: "#FF5A5A", l: "Expense" }, { c: "#7C6FFF", l: "Net" }].map((x) => (
              <span key={x.l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: t.textSec }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: x.c }} />{x.l}
              </span>
            ))}
          </div>
        </div>
        <MonthBar data={monthly} t={t} />
      </div>

      {/* ── Category Spending Progress Bars ──────────────────────────────── */}
      <div style={{
        background: t.surface, border: `1px solid ${t.border}`,
        borderRadius: 14, padding: "16px 16px",
        animation: "fadeUp 0.4s ease 0.15s both",
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: t.text, marginBottom: 14 }}>
          Category Breakdown
        </div>

        {catSpend.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0", color: t.textMuted, fontSize: 12 }}>
            No expense data yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {catSpend.map((c) => {
              const pct = catTotal > 0 ? Math.round((c.amount / catTotal) * 100) : 0;
              return (
                <div key={c.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15 }}>{c.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{c.label}</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: t.textMuted }}>{pct}%</span>
                      <span style={{ fontSize: 12, fontWeight: 900, color: t.text, minWidth: 72, textAlign: "right" }}>
                        {inr(c.amount)}
                      </span>
                    </div>
                  </div>
                  {/* Animated fill bar */}
                  <div style={{ height: 4, borderRadius: 3, background: t.border, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 3, background: c.color,
                      width: `${pct}%`, transition: "width 0.9s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
