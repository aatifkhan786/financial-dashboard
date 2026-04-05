// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — Root component. Owns all shared state and handles layout.
//
// State hierarchy:
//   txs      → all transactions (persisted)
//   role     → "admin" | "viewer" (persisted)
//   isDark   → theme flag (persisted)
//   page     → active page (not persisted — starts fresh each visit)
//   isMobile → responsive flag (derived from window width)
//
// On mobile (< 640px):
//   - TopNav shows only logo + role + theme (no tabs)
//   - A fixed bottom nav bar shows the three page tabs
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { THEMES, SEED } from "./constants";
import TopNav      from "./components/TopNav";
import Overview    from "./pages/Overview";
import Transactions from "./pages/Transactions";
import Insights    from "./pages/Insights";

export default function App() {

  // ── Persistent state — synced to localStorage via useEffect ──────────────
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("fiq2_dark") !== "false"; } catch { return true; }
  });
  const [role, setRole] = useState(() => {
    try { return localStorage.getItem("fiq2_role") || "admin"; } catch { return "admin"; }
  });
  const [txs, setTxs] = useState(() => {
    try {
      const stored = localStorage.getItem("fiq2_txs");
      return stored ? JSON.parse(stored) : SEED;
    } catch { return SEED; }
  });

  // ── Ephemeral state ───────────────────────────────────────────────────────
  const [page,     setPage]     = useState("overview");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const t = isDark ? THEMES.dark : THEMES.light;

  // Sync to localStorage whenever state changes
  useEffect(() => { try { localStorage.setItem("fiq2_dark", isDark); } catch {} }, [isDark]);
  useEffect(() => { try { localStorage.setItem("fiq2_role", role); }  catch {} }, [role]);
  useEffect(() => { try { localStorage.setItem("fiq2_txs", JSON.stringify(txs)); } catch {} }, [txs]);

  // Update isMobile on resize
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Inject DM Sans font + global animation keyframes once on mount
  useEffect(() => {
    if (!document.getElementById("fiq2-font")) {
      const link = document.createElement("link");
      link.id = "fiq2-font";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap";
      document.head.appendChild(link);
    }

    if (!document.getElementById("fiq2-global")) {
      const style = document.createElement("style");
      style.id = "fiq2-global";
      style.textContent = `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { font-family: 'DM Sans', -apple-system, sans-serif; }

        /* Thin custom scrollbar */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 4px; }

        /* Page-level entrance animation used by all cards and sections */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Modal slide-in */
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Remove number input arrows */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Tab items used by both TopNav and the mobile bottom nav
  const TABS = [
    { id: "overview",     label: "Overview",     icon: "⊞" },
    { id: "transactions", label: "Transactions", icon: "≡" },
    { id: "insights",     label: "Insights",     icon: "◎" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: t.bg,
      color: t.text,
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      transition: "background 0.2s, color 0.2s",
    }}>

      {/* ── Sticky top nav ──────────────────────────────────────────────── */}
      <TopNav
        page={page} setPage={setPage}
        role={role} setRole={setRole}
        isDark={isDark} setIsDark={setIsDark}
        t={t} isMobile={isMobile}
      />

      {/* ── Main scrollable content ─────────────────────────────────────── */}
      <main style={{
        // Leave room for mobile bottom nav
        paddingBottom: isMobile ? 72 : 24,
        minHeight: "calc(100vh - 54px)",
      }}>
        {page === "overview"      && <Overview     txs={txs} setTxs={setTxs} role={role} t={t} setPage={setPage} />}
        {page === "transactions"  && <Transactions txs={txs} setTxs={setTxs} role={role} t={t} />}
        {page === "insights"      && <Insights     txs={txs}                  t={t} />}
      </main>

      {/* ── Mobile bottom navigation (only renders on small screens) ─────── */}
      {isMobile && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 300,
          display: "flex",
          background: t.isDark ? "rgba(7,8,15,0.95)" : "rgba(238,240,255,0.95)",
          backdropFilter: "blur(16px)",
          borderTop: `1px solid ${t.border}`,
          padding: "6px 0 10px",
        }}>
          {TABS.map((tab) => {
            const active = page === tab.id;
            return (
              <button key={tab.id} onClick={() => setPage(tab.id)} style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", gap: 3,
                background: "none", border: "none",
                cursor: "pointer", padding: "6px 0",
                fontFamily: "inherit",
              }}>
                <span style={{
                  fontSize: 18, lineHeight: 1,
                  color: active ? t.accent : t.textMuted,
                  transition: "color 0.15s",
                }}>
                  {tab.icon}
                </span>
                <span style={{
                  fontSize: 9, fontWeight: active ? 800 : 500,
                  color: active ? t.accent : t.textMuted,
                  transition: "color 0.15s",
                }}>
                  {tab.label}
                </span>
                {/* Active dot indicator */}
                {active && (
                  <div style={{
                    width: 4, height: 4, borderRadius: "50%",
                    background: t.accent, marginTop: 1,
                  }} />
                )}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
