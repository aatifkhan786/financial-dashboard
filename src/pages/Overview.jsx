// ─────────────────────────────────────────────────────────────────────────────
// Overview.jsx — Main dashboard. Bento grid layout:
//   Row 1: [Hero Balance (2/3)] [Savings Rate ring (1/3)]
//   Row 2: Income card + Expenses card + Tx count card
//   Row 3: Area trend chart (2/3) + Donut chart (1/3)
//   Row 4: Recent activity feed (full width)
//
// RBAC:
//   Admin  → Quick Actions row, floating + FAB, edit buttons on recent rows
//   Viewer → Read-only banner, all mutation controls hidden
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState, useEffect } from "react";
import { TrendArea, SpendDonut } from "../components/Charts";
import TxModal from "../components/TxModal";
import { CAT } from "../constants";
import { inr, fmtDate, monthLabel, uid } from "../utils";

// ── Animated counter — eases from 0 → target over `ms` milliseconds ─────────
function useCountUp(target, ms = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / ms, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setVal(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return val;
}

// ── Small SVG ring used on the Savings Rate card ─────────────────────────────
function SavingsRing({ pct, t }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const fill = Math.min(pct, 100);
  const color = pct >= 20 ? t.green : t.amber;
  return (
    <svg
      width={86}
      height={86}
      viewBox="0 0 86 86"
      style={{ transform: "rotate(-90deg)" }}
    >
      {/* Track */}
      <circle
        cx="43"
        cy="43"
        r={r}
        fill="none"
        stroke={t.border}
        strokeWidth="6"
      />
      {/* Fill — animates via CSS transition on stroke-dasharray */}
      <circle
        cx="43"
        cy="43"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${(fill / 100) * circ} ${circ}`}
        style={{ transition: "stroke-dasharray 1.2s ease" }}
      />
    </svg>
  );
}

// ── Stat card with animated number and colored accent bar ────────────────────
function StatCard({
  label,
  value,
  icon,
  accentColor,
  accentSoft,
  detail,
  idx,
  t,
}) {
  const animated = useCountUp(value);
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 14,
        padding: "16px 16px",
        position: "relative",
        overflow: "hidden",
        animation: "fadeUp 0.4s ease both",
        animationDelay: `${idx * 70}ms`,
        transition: "transform 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = t.borderMed;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = t.border;
      }}
    >
      {/* Decorative glow circle */}
      <div
        style={{
          position: "absolute",
          top: -14,
          right: -14,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: accentSoft,
          pointerEvents: "none",
        }}
      />

      <div style={{ fontSize: 20, marginBottom: 10 }}>{icon}</div>
      <div
        style={{
          fontSize: 11,
          color: t.textSec,
          marginBottom: 4,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 900,
          color: t.text,
          letterSpacing: "-0.4px",
        }}
      >
        {inr(animated)}
      </div>
      {detail && (
        <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4 }}>
          {detail}
        </div>
      )}

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
        }}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Overview({ txs, setTxs, role, t,setPage }) {
  const isAdmin = role === "admin";
  const [modal, setModal] = useState(null); // null | { tx }

  // ── Aggregate totals ──────────────────────────────────────────────────────
  const totalIncome = useMemo(
    () =>
      txs.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0),
    [txs],
  );
  const totalExpenses = useMemo(
    () =>
      txs.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0),
    [txs],
  );
  const balance = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  // Animated balance counter at the top level (stays stable between re-renders)
  const animatedBalance = useCountUp(balance);

  // ── Monthly data for area chart ───────────────────────────────────────────
  const monthly = useMemo(() => {
    const map = {};
    txs.forEach((x) => {
      const k = monthLabel(x.date);
      if (!map[k]) map[k] = { month: k, income: 0, expense: 0 };
      map[k][x.type === "income" ? "income" : "expense"] += x.amount;
    });
    return Object.values(map).map((m) => ({ ...m, net: m.income - m.expense }));
  }, [txs]);

  // ── Category spending for donut ───────────────────────────────────────────
  const catData = useMemo(() => {
    const map = {};
    txs
      .filter((x) => x.type === "expense")
      .forEach((x) => {
        map[x.category] = (map[x.category] || 0) + x.amount;
      });
    return Object.entries(map)
      .map(([k, v]) => ({
        name: CAT[k]?.label || k,
        value: v,
        color: CAT[k]?.color || "#888",
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [txs]);
  const catTotal = catData.reduce((s, c) => s + c.value, 0);

  // Latest 6 transactions for the recent feed
  const recent = useMemo(() => [...txs].reverse().slice(0, 6), [txs]);

  const saveTransaction = (tx) => {
    setTxs((prev) =>
      prev.some((x) => x.id === tx.id)
        ? prev.map((x) => (x.id === tx.id ? tx : x))
        : [...prev, tx],
    );
    setModal(null);
  };

  return (
    <div style={{ padding: "16px", maxWidth: 1200, margin: "0 auto" }}>
      {/* ── Viewer: Read-only banner ─────────────────────────────────────── */}
      {!isAdmin && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
            padding: "10px 14px",
            borderRadius: 11,
            background: t.blueSoft,
            border: `1px solid ${t.blue}44`,
            animation: "fadeUp 0.3s ease",
          }}
        >
          <span style={{ fontSize: 16 }}>👁</span>
          <div>
            <span style={{ fontSize: 12, fontWeight: 800, color: t.blue }}>
              Viewer Mode — Read Only
            </span>
            <span style={{ fontSize: 11, color: t.textSec, marginLeft: 8 }}>
              You can view all data but cannot add or modify transactions.
            </span>
          </div>
        </div>
      )}

      {/* ── Admin: Quick Actions ─────────────────────────────────────────── */}
      {isAdmin && (
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 13,
            padding: "12px 14px",
            marginBottom: 14,
            animation: "fadeUp 0.3s ease",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: t.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 10,
            }}
          >
            Quick Actions
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
            }}
          >
            {[
              {
                label: "Add Income",
                icon: "↑",
                color: t.green,
                bg: t.greenSoft,
                action: () => setModal({ tx: { type: "income" } }),
              },
              {
                label: "Add Expense",
                icon: "↓",
                color: t.red,
                bg: t.redSoft,
                action: () => setModal({ tx: { type: "expense" } }),
              },
              {
                label: "Transactions",
                icon: "≡",
                color: t.accent,
                bg: t.accentSoft,
                action: () => setPage("transactions"),
              },
              {
                label: "Insights",
                icon: "◎",
                color: t.teal,
                bg: t.tealSoft,
                action: () => setPage("insights"),
              },
            ].map((qa) => (
              <button
                key={qa.label}
                onClick={qa.action}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 6px",
                  borderRadius: 10,
                  background: qa.bg,
                  border: `1px solid ${qa.color}33`,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span
                  style={{ fontSize: 18, fontWeight: 900, color: qa.color }}
                >
                  {qa.icon}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: qa.color,
                    textAlign: "center",
                  }}
                >
                  {qa.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Row 1: Hero Balance + Savings Rate ──────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 12,
          marginBottom: 12,
        }}
      >
        {/* Hero Balance Card */}
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            padding: "22px 24px",
            position: "relative",
            overflow: "hidden",
            animation: "fadeUp 0.35s ease",
            // Violet glow from the left
            backgroundImage: `radial-gradient(ellipse at 0% 60%, ${t.accentGlow} 0%, transparent 65%)`,
          }}
        >
          <div style={{ position: "absolute", top: 16, right: 16 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: "3px 9px",
                borderRadius: 20,
                background: isAdmin ? t.amberSoft : t.blueSoft,
                color: isAdmin ? t.amber : t.blue,
                border: `1px solid ${isAdmin ? t.amber + "44" : t.blue + "44"}`,
              }}
            >
              {isAdmin ? "👑 Admin" : "👁 Viewer"}
            </span>
          </div>

          <div
            style={{
              fontSize: 12,
              color: t.textSec,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            💰 Total Balance
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: t.text,
              letterSpacing: "-1px",
              lineHeight: 1,
              marginBottom: 14,
            }}
          >
            {inr(animatedBalance)}
          </div>

          {/* Income / Expense pills */}
          <div style={{ display: "flex", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 10,
                background: t.greenSoft,
              }}
            >
              <span style={{ fontSize: 11, color: t.green }}>↑</span>
              <div>
                <div
                  style={{ fontSize: 9, color: t.textMuted, fontWeight: 600 }}
                >
                  INCOME
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: t.green }}>
                  {inr(totalIncome)}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 10,
                background: t.redSoft,
              }}
            >
              <span style={{ fontSize: 11, color: t.red }}>↓</span>
              <div>
                <div
                  style={{ fontSize: 9, color: t.textMuted, fontWeight: 600 }}
                >
                  EXPENSES
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: t.red }}>
                  {inr(totalExpenses)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Rate Card with ring */}
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            padding: "18px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            animation: "fadeUp 0.4s ease 0.05s both",
          }}
        >
          <div style={{ fontSize: 11, color: t.textSec, fontWeight: 600 }}>
            Savings Rate
          </div>
          <div
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SavingsRing pct={savingsRate} t={t} />
            <div style={{ position: "absolute", textAlign: "center" }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: savingsRate >= 20 ? t.green : t.amber,
                }}
              >
                {savingsRate}%
              </div>
            </div>
          </div>
          <div
            style={{ fontSize: 10, color: t.textMuted, textAlign: "center" }}
          >
            {savingsRate >= 20 ? "✅ Above 20% goal" : "⚠️ Target: 20%"}
          </div>
        </div>
      </div>

      {/* ── Row 2: Stat Cards ────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <StatCard
          label="Total Income"
          value={totalIncome}
          icon="📥"
          accentColor={t.green}
          accentSoft={t.greenSoft}
          detail="All time"
          idx={0}
          t={t}
        />
        <StatCard
          label="Total Expenses"
          value={totalExpenses}
          icon="📤"
          accentColor={t.red}
          accentSoft={t.redSoft}
          detail="All time"
          idx={1}
          t={t}
        />
        <StatCard
          label="Transactions"
          value={txs.length}
          icon="🗒️"
          accentColor={t.accent}
          accentSoft={t.accentSoft}
          detail={`${txs.filter((x) => x.type === "expense").length} expenses`}
          idx={2}
          t={t}
        />
      </div>

      {/* ── Row 3: Area Chart + Donut ─────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 12,
          marginBottom: 12,
        }}
      >
        {/* Trend chart */}
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            padding: "16px 14px",
            animation: "fadeUp 0.4s ease 0.1s both",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: t.text }}>
                Balance Trend
              </div>
              <div style={{ fontSize: 10, color: t.textMuted }}>
                6-month overview
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { c: "#00D97E", l: "Income" },
                { c: "#FF5A5A", l: "Expense" },
                { c: "#7C6FFF", l: "Net" },
              ].map((x) => (
                <span
                  key={x.l}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    color: t.textSec,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 2,
                      background: x.c,
                    }}
                  />
                  {x.l}
                </span>
              ))}
            </div>
          </div>
          <TrendArea data={monthly} t={t} />
        </div>

        {/* Donut chart */}
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            padding: "16px 14px",
            animation: "fadeUp 0.4s ease 0.15s both",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: t.text,
              marginBottom: 2,
            }}
          >
            Spending
          </div>
          <div style={{ fontSize: 10, color: t.textMuted, marginBottom: 6 }}>
            By category
          </div>
          <SpendDonut data={catData} t={t} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              marginTop: 6,
            }}
          >
            {catData.slice(0, 4).map((c) => (
              <div
                key={c.name}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 2,
                    background: c.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: t.textSec,
                    flex: 1,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {c.name}
                </span>
                <span style={{ fontSize: 10, fontWeight: 800, color: t.text }}>
                  {Math.round((c.value / catTotal) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 4: Recent Activity ───────────────────────────────────────── */}
      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 14,
          overflow: "hidden",
          animation: "fadeUp 0.4s ease 0.2s both",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: `1px solid ${t.border}`,
            background: t.isDark
              ? "rgba(255,255,255,0.02)"
              : "rgba(0,0,0,0.02)",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: t.text }}>
              Recent Activity
            </div>
            <div style={{ fontSize: 10, color: t.textMuted }}>
              {isAdmin ? "Latest transactions" : "🔒 Read-only"}
            </div>
          </div>
          {/* Admin sees Add button here too */}
          {isAdmin && (
            <button
              onClick={() => setModal({ tx: null })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: t.accent,
                border: "none",
                borderRadius: 8,
                padding: "5px 11px",
                fontSize: 11,
                fontWeight: 900,
                color: "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              + Add
            </button>
          )}
        </div>

        {recent.map((x, i) => {
          const cat = CAT[x.category];
          return (
            <div
              key={x.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 16px",
                borderBottom:
                  i < recent.length - 1 ? `1px solid ${t.border}` : "none",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = t.surfaceHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span
                style={{
                  fontSize: 18,
                  width: 28,
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                {cat?.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: t.text,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {x.description}
                </div>
                <div style={{ fontSize: 10, color: t.textMuted }}>
                  {fmtDate(x.date)} · {cat?.label}
                </div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: x.type === "income" ? t.green : t.red,
                  flexShrink: 0,
                }}
              >
                {x.type === "income" ? "+" : "−"}
                {inr(x.amount)}
              </div>
              {/* Admin gets inline edit icon */}
              {isAdmin && (
                <button
                  onClick={() => setModal({ tx: x })}
                  style={{
                    background: "none",
                    border: `1px solid ${t.border}`,
                    borderRadius: 7,
                    padding: "4px 6px",
                    cursor: "pointer",
                    display: "flex",
                    opacity: 0.4,
                    transition: "opacity 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.borderColor = t.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.4";
                    e.currentTarget.style.borderColor = t.border;
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={t.accent}
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Admin: Floating Action Button ───────────────────────────────── */}
      {isAdmin && (
        <button
          onClick={() => setModal({ tx: null })}
          title="Add transaction"
          style={{
            position: "fixed",
            bottom: 28,
            right: 24,
            zIndex: 500,
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: "none",
            background: `linear-gradient(135deg, ${t.accent}, ${t.accentHover})`,
            color: "#fff",
            fontSize: 24,
            cursor: "pointer",
            boxShadow: `0 6px 20px ${t.accentSoft}, 0 2px 8px rgba(0,0,0,0.3)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          +
        </button>
      )}

      {modal && (
        <TxModal
          tx={modal.tx}
          onSave={saveTransaction}
          onClose={() => setModal(null)}
          t={t}
        />
      )}
    </div>
  );
}
