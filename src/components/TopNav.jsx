// ─────────────────────────────────────────────────────────────────────────────
// TopNav.jsx — Sticky top bar. Logo + page tabs + role switcher + theme toggle.
// On mobile (< 640px) the three page tabs hide from here — they show in the
// bottom nav rendered by App.jsx instead.
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview",      label: "Overview"      },
  { id: "transactions",  label: "Transactions"  },
  { id: "insights",      label: "Insights"      },
];

export default function TopNav({ page, setPage, role, setRole, isDark, setIsDark, t, isMobile }) {
  const isAdmin = role === "admin";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 200,
      display: "flex", alignItems: "center", gap: 12,
      padding: "0 20px", height: 54,
      background: t.isDark
        ? "rgba(7,8,15,0.9)"
        : "rgba(238,240,255,0.9)",
      backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${t.border}`,
    }}>

      {/* ── Logo ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentHover} 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 900, color: "#fff",
          boxShadow: `0 4px 12px ${t.accentSoft}`,
        }}>
          ₹
        </div>
        <span style={{ fontSize: 15, fontWeight: 900, color: t.text, letterSpacing: "-0.3px" }}>
          FinanceIQ
        </span>
      </div>

      {/* ── Page tabs (desktop only — hidden on mobile) ─────────────────── */}
      {!isMobile && (
        <nav style={{
          display: "flex", gap: 2,
          background: t.surfaceUp, borderRadius: 10,
          padding: 3, border: `1px solid ${t.border}`,
          marginLeft: 12,
        }}>
          {TABS.map((tab) => {
            const active = page === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setPage(tab.id)}
                style={{
                  padding: "6px 14px", borderRadius: 8,
                  fontSize: 12, fontWeight: active ? 700 : 500,
                  border: "none", cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.18s",
                  background: active ? t.accent : "transparent",
                  color: active ? "#fff" : t.textSec,
                  boxShadow: active ? `0 2px 10px ${t.accentSoft}` : "none",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = t.text; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = t.textSec; }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      )}

      <div style={{ flex: 1 }} />

      {/* ── Role Switcher — color changes visibly with role ─────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "5px 10px", borderRadius: 9,
        background: isAdmin ? t.amberSoft : t.blueSoft,
        border: `1px solid ${isAdmin ? t.amber + "44" : t.blue + "44"}`,
        transition: "all 0.25s",
      }}>
        <span style={{ fontSize: 13 }}>{isAdmin ? "👑" : "👁"}</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            background: "transparent", border: "none", outline: "none",
            fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            color: isAdmin ? t.amber : t.blue,
          }}
        >
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      {/* ── Theme Toggle ────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsDark((d) => !d)}
        title="Toggle theme"
        style={{
          background: t.surfaceUp, border: `1px solid ${t.border}`,
          borderRadius: 8, padding: "6px 8px", cursor: "pointer",
          display: "flex", alignItems: "center", flexShrink: 0,
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = t.borderMed)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = t.border)}
      >
        {/* Sun / Moon icons inline */}
        {isDark ? (
          // Sun icon
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.amber} strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          // Moon icon
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
        )}
      </button>

      {/* ── Avatar — initials match role ────────────────────────────────── */}
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: isAdmin
          ? `linear-gradient(135deg, ${t.amber}, #E8820A)`
          : `linear-gradient(135deg, ${t.blue}, #1050B0)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 900, color: "#fff", userSelect: "none",
        transition: "background 0.3s",
      }}>
        {isAdmin ? "AD" : "VW"}
      </div>
    </header>
  );
}
