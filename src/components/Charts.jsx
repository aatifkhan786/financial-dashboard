// ─────────────────────────────────────────────────────────────────────────────
// Charts.jsx — Three Recharts wrappers: TrendArea, SpendDonut, MonthBar.
// All in one file since they're small and always imported together.
// Each takes `data` + `t` (theme) as props.
// ─────────────────────────────────────────────────────────────────────────────

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { inr } from "../utils";

// ── Shared custom tooltip (used by all three charts) ─────────────────────────
// Recharts calls this with active/payload/label. We close over `t` via wrapper.
const Tip = ({ active, payload, label, t }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.borderMed}`,
      borderRadius: 10, padding: "10px 14px", fontSize: 12, minWidth: 150,
      boxShadow: t.isDark ? "0 8px 28px rgba(0,0,0,0.6)" : "0 4px 20px rgba(0,0,0,0.12)",
    }}>
      {label && (
        <div style={{ color: t.textSec, marginBottom: 8, fontWeight: 700, fontSize: 11 }}>
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 7,
          marginBottom: i < payload.length - 1 ? 5 : 0,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }}/>
          <span style={{ color: t.textSec, flex: 1 }}>{p.name}</span>
          <span style={{ fontWeight: 800, color: t.text }}>{inr(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── 1. TrendArea — 6-month income / expense / net area chart ─────────────────
export function TrendArea({ data, t }) {
  // tip wrapper closes over the theme without prop drilling into Recharts internals
  const tip = (props) => <Tip {...props} t={t} />;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#00D97E" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00D97E" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#FF5A5A" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#FF5A5A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: t.axis, fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: t.axis, fontSize: 10 }} axisLine={false} tickLine={false}
          tickFormatter={(v) => inr(v, true)} width={48} />
        <Tooltip content={tip} />
        <Area type="monotone" dataKey="income"  name="Income"   stroke="#00D97E" strokeWidth={2}   fill="url(#gIncome)" />
        <Area type="monotone" dataKey="expense" name="Expenses" stroke="#FF5A5A" strokeWidth={2}   fill="url(#gExpense)" />
        <Area type="monotone" dataKey="net"     name="Net"      stroke="#7C6FFF" strokeWidth={2.2} fill="none" strokeDasharray="5 3" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── 2. SpendDonut — Spending breakdown by category ───────────────────────────
export function SpendDonut({ data, t }) {
  const tip = (props) => <Tip {...props} t={t} />;
  return (
    <ResponsiveContainer width="100%" height={170}>
      <PieChart>
        <Pie
          data={data} cx="50%" cy="50%"
          innerRadius={44} outerRadius={70}
          paddingAngle={3} dataKey="value" stroke="none"
        >
          {data.map((c, i) => <Cell key={i} fill={c.color} />)}
        </Pie>
        <Tooltip
          content={tip}
          formatter={(v) => [inr(v), "Spent"]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── 3. MonthBar — Side-by-side monthly income vs expenses ────────────────────
export function MonthBar({ data, t }) {
  const tip = (props) => <Tip {...props} t={t} />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="32%">
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: t.axis, fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: t.axis, fontSize: 10 }} axisLine={false} tickLine={false}
          tickFormatter={(v) => inr(v, true)} width={48} />
        <Tooltip content={tip} />
        <Bar dataKey="income"  name="Income"   fill="#00D97E" radius={[4, 4, 0, 0]} fillOpacity={0.85} barSize={18} />
        <Bar dataKey="expense" name="Expenses" fill="#FF5A5A" radius={[4, 4, 0, 0]} fillOpacity={0.85} barSize={18} />
        <Bar dataKey="net"     name="Net"      fill="#7C6FFF" radius={[4, 4, 0, 0]} fillOpacity={0.7}  barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
