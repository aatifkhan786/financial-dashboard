// ─────────────────────────────────────────────────────────────────────────────
// Transactions.jsx — Grouped-by-month timeline view.
// Each month has a header showing the month name + net total for that month.
// Search, type filter, category filter, month filter all work together.
//
// RBAC:
//   Admin  → Add button, Edit + Delete on each row, floating FAB
//   Viewer → Blue read-only banner, zero mutation controls
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useCallback } from "react";
import TxModal from "../components/TxModal";
import { CAT } from "../constants";
import { inr, fmtDate, groupByMonth, uid } from "../utils";

export default function Transactions({ txs, setTxs, role, t }) {
  const isAdmin = role === "admin";

  // ── Filter + sort state ───────────────────────────────────────────────────
  const [search,      setSearch]      = useState("");
  const [filterType,  setFilterType]  = useState("all");
  const [filterCat,   setFilterCat]   = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [modal,       setModal]       = useState(null);

  // Unique month options derived from actual data
  const monthOptions = useMemo(() => {
    const s = new Set(txs.map((x) => x.date.slice(0, 7)));
    return [...s].sort().reverse();
  }, [txs]);

  // Apply all active filters in one pass, then group by month
  const groups = useMemo(() => {
    let r = [...txs];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((x) =>
        x.description.toLowerCase().includes(q) ||
        CAT[x.category]?.label.toLowerCase().includes(q)
      );
    }
    if (filterType  !== "all") r = r.filter((x) => x.type     === filterType);
    if (filterCat   !== "all") r = r.filter((x) => x.category === filterCat);
    if (filterMonth !== "all") r = r.filter((x) => x.date.startsWith(filterMonth));
    return groupByMonth(r); // sorted newest-first by month
  }, [txs, search, filterType, filterCat, filterMonth]);

  const totalVisible = Object.values(groups).flat().length;

  // ── CRUD handlers (admin-only calls) ─────────────────────────────────────
  const saveTransaction = useCallback((tx) => {
    setTxs((prev) =>
      prev.some((x) => x.id === tx.id)
        ? prev.map((x) => (x.id === tx.id ? tx : x))
        : [...prev, tx]
    );
    setModal(null);
  }, [setTxs]);

  const deleteTx = useCallback((id) => {
    if (window.confirm("Delete this transaction permanently?"))
      setTxs((prev) => prev.filter((x) => x.id !== id));
  }, [setTxs]);

  // Export whatever is currently visible as CSV
  const exportCSV = () => {
    const rows = [["Date", "Description", "Category", "Type", "Amount"]].concat(
      Object.values(groups).flat().map((x) => [
        x.date, `"${x.description}"`, CAT[x.category]?.label, x.type, x.amount,
      ])
    );
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob), download: "transactions.csv",
    }).click();
  };

  // Shared select style
  const sel = {
    background: t.surfaceUp, border: `1px solid ${t.border}`, borderRadius: 9,
    padding: "7px 11px", color: t.text, fontSize: 11, outline: "none",
    cursor: "pointer", fontFamily: "inherit",
  };

  return (
    <div style={{ padding: "16px", maxWidth: 1000, margin: "0 auto" }}>

      {/* ── Viewer: read-only banner ──────────────────────────────────────── */}
      {!isAdmin && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
          padding: "10px 14px", borderRadius: 11,
          background: t.blueSoft, border: `1px solid ${t.blue}44`,
          animation: "fadeUp 0.3s ease",
        }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: t.blue }}>Viewer Mode</span>
          <span style={{ fontSize: 11, color: t.textSec }}>
            — You can browse and export, but cannot add, edit, or delete transactions.
          </span>
        </div>
      )}

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div style={{
        background: t.surface, border: `1px solid ${t.border}`, borderRadius: 13,
        padding: "12px 14px", marginBottom: 12, display: "flex", gap: 8,
        flexWrap: "wrap", alignItems: "center", animation: "fadeUp 0.3s ease",
      }}>
        {/* Search input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 7, flex: "1 1 160px",
          background: t.bgAlt, borderRadius: 9, padding: "7px 11px", border: `1px solid ${t.border}`,
        }}>
          {/* Search icon */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            style={{
              border: "none", background: "transparent", outline: "none",
              fontSize: 11, color: t.text, flex: 1, fontFamily: "inherit",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        <select value={filterType}  onChange={(e) => setFilterType(e.target.value)}  style={sel}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select value={filterCat}   onChange={(e) => setFilterCat(e.target.value)}   style={sel}>
          <option value="all">All Categories</option>
          {Object.entries(CAT).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>

        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={sel}>
          <option value="all">All Months</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {new Date(m + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </option>
          ))}
        </select>

        <div style={{ flex: 1 }} />

        {/* Export — both roles can export */}
        <button onClick={exportCSV} style={{
          display: "flex", alignItems: "center", gap: 5, padding: "7px 12px",
          background: "transparent", border: `1px solid ${t.border}`, borderRadius: 9,
          color: t.textSec, fontSize: 11, cursor: "pointer", fontWeight: 700, fontFamily: "inherit",
        }}>
          ↓ Export CSV
        </button>

        {/* Add button — Admin only */}
        {isAdmin && (
          <button onClick={() => setModal({ tx: null })} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "7px 14px",
            background: t.accent, border: "none", borderRadius: 9,
            color: "#fff", fontSize: 11, cursor: "pointer", fontWeight: 900, fontFamily: "inherit",
            boxShadow: `0 3px 12px ${t.accentSoft}`,
          }}>
            + Add
          </button>
        )}
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
        {(() => {
          const flat = Object.values(groups).flat();
          const inc = flat.filter((x) => x.type === "income" ).reduce((s, x) => s + x.amount, 0);
          const exp = flat.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0);
          return [
            { label: `${totalVisible} transactions`, color: t.textSec  },
            { label: `↑ ${inr(inc)}`,                color: t.green    },
            { label: `↓ ${inr(exp)}`,                color: t.red      },
            { label: `Net ${inr(inc - exp)}`,         color: inc - exp >= 0 ? t.accent : t.red },
          ].map((s) => (
            <span key={s.label} style={{
              fontSize: 10, fontWeight: 800, color: s.color,
              background: t.surface, border: `1px solid ${t.border}`,
              padding: "3px 10px", borderRadius: 20,
            }}>
              {s.label}
            </span>
          ));
        })()}
      </div>

      {/* ── Month groups (timeline) ───────────────────────────────────────── */}
      {Object.keys(groups).length === 0 ? (
        // Empty state
        <div style={{
          padding: "56px 24px", textAlign: "center",
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14,
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.textSec, marginBottom: 6 }}>No transactions found</div>
          <div style={{ fontSize: 12, color: t.textMuted }}>Adjust your search or filters.</div>
          {isAdmin && (
            <button onClick={() => setModal({ tx: null })} style={{
              marginTop: 16, padding: "8px 20px", borderRadius: 10, border: "none",
              background: t.accent, color: "#fff", fontSize: 12, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              + Add your first transaction
            </button>
          )}
        </div>
      ) : (
        Object.entries(groups).map(([month, rows], gi) => {
          // Net for this month
          const monthInc = rows.filter((x) => x.type === "income" ).reduce((s, x) => s + x.amount, 0);
          const monthExp = rows.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0);
          const monthNet = monthInc - monthExp;

          return (
            <div key={month} style={{ marginBottom: 12, animation: `fadeUp 0.35s ease ${gi * 60}ms both` }}>

              {/* Month header */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 14px", marginBottom: 4,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: t.textSec }}>{month}</span>
                  <span style={{ fontSize: 10, color: t.textMuted }}>{rows.length} entries</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: monthNet >= 0 ? t.green : t.red }}>
                  {monthNet >= 0 ? "+" : ""}{inr(monthNet)}
                </span>
              </div>

              {/* Transaction rows for this month */}
              <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 13, overflow: "hidden" }}>
                {rows.map((x, i) => {
                  const cat = CAT[x.category];
                  return (
                    <div key={x.id} style={{
                      display: "grid",
                      // Admin gets an extra column for actions
                      gridTemplateColumns: isAdmin ? "28px 1fr 110px 70px 110px 62px" : "28px 1fr 110px 70px 110px",
                      alignItems: "center", padding: "10px 14px", gap: 12,
                      borderBottom: i < rows.length - 1 ? `1px solid ${t.border}` : "none",
                      transition: "background 0.1s",
                    }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = t.surfaceHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Emoji icon */}
                      <span style={{ fontSize: 16, textAlign: "center" }}>{cat?.icon}</span>

                      {/* Description */}
                      <span style={{
                        fontSize: 12, fontWeight: 700, color: t.text,
                        overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                      }}>
                        {x.description}
                      </span>

                      {/* Category label */}
                      <span style={{ fontSize: 10, color: t.textSec, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {cat?.label}
                      </span>

                      {/* Type badge */}
                      <span style={{
                        fontSize: 9, fontWeight: 900, padding: "3px 8px", borderRadius: 20,
                        textTransform: "uppercase", letterSpacing: "0.05em", width: "fit-content",
                        background: x.type === "income" ? t.greenSoft : t.redSoft,
                        color:      x.type === "income" ? t.green     : t.red,
                      }}>
                        {x.type}
                      </span>

                      {/* Amount */}
                      <span style={{ fontSize: 12, fontWeight: 900, color: x.type === "income" ? t.green : t.red, textAlign: "right" }}>
                        {x.type === "income" ? "+" : "−"}{inr(x.amount)}
                      </span>

                      {/* Admin: edit + delete ─────────────────────────────── */}
                      {isAdmin && (
                        <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                          <button onClick={() => setModal({ tx: x })} style={{
                            background: "none", border: `1px solid ${t.border}`, borderRadius: 7,
                            padding: "4px 6px", cursor: "pointer", display: "flex",
                            transition: "border-color 0.15s",
                          }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = t.accent)}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = t.border)}
                          >
                            {/* Edit icon */}
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button onClick={() => deleteTx(x.id)} style={{
                            background: "none", border: `1px solid ${t.border}`, borderRadius: 7,
                            padding: "4px 6px", cursor: "pointer", display: "flex",
                            transition: "border-color 0.15s",
                          }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = t.red)}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = t.border)}
                          >
                            {/* Trash icon */}
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={t.red} strokeWidth="2" strokeLinecap="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* ── Admin: Floating Action Button ────────────────────────────────── */}
      {isAdmin && (
        <button onClick={() => setModal({ tx: null })} title="Add transaction" style={{
          position: "fixed", bottom: 28, right: 24, zIndex: 500,
          width: 50, height: 50, borderRadius: "50%", border: "none",
          background: `linear-gradient(135deg, ${t.accent}, ${t.accentHover})`,
          color: "#fff", fontSize: 24, cursor: "pointer",
          boxShadow: `0 6px 20px ${t.accentSoft}, 0 2px 8px rgba(0,0,0,0.3)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.15s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          +
        </button>
      )}

      {modal && (
        <TxModal tx={modal.tx} onSave={saveTransaction} onClose={() => setModal(null)} t={t} />
      )}
    </div>
  );
}
