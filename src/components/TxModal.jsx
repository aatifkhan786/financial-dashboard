// ─────────────────────────────────────────────────────────────────────────────
// TxModal.jsx — Add or Edit a transaction. Admin-only.
// Validates inline, resets category when type is switched.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { CAT } from "../constants";
import { uid } from "../utils";

export default function TxModal({ tx, onSave, onClose, t }) {
  const isEdit = !!tx?.id;

  // Pre-fill with existing values when editing, or safe defaults when adding
  const [form, setForm] = useState({
    description: tx?.description || "",
    category:    tx?.category    || "food",
    amount:      tx?.amount      || "",
    date:        tx?.date        || new Date().toISOString().slice(0, 10),
    type:        tx?.type        || "expense",
  });
  const [errors, setErrors] = useState({});

  // Filter categories to only those matching the current type
  const cats = Object.entries(CAT).filter(([, v]) => v.type === form.type);

  const validate = () => {
    const e = {};
    if (!form.description.trim())                               e.description = "Required";
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) e.amount = "Enter a valid amount";
    if (!form.date)                                             e.date = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({ ...tx, ...form, amount: +form.amount, id: tx?.id || uid() });
  };

  // When type changes, also reset category to the first match
  const switchType = (type) => {
    const first = Object.entries(CAT).find(([, v]) => v.type === type)?.[0] || "";
    setForm((f) => ({ ...f, type, category: first }));
    setErrors({});
  };

  // Shared input style (border turns red on error)
  const inp = (field) => ({
    width: "100%", padding: "9px 12px", fontSize: 13, fontFamily: "inherit",
    background: t.bgAlt, border: `1px solid ${errors[field] ? t.red : t.border}`,
    borderRadius: 9, color: t.text, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s",
    colorScheme: t.isDark ? "dark" : "light",
  });

  return (
    // Click outside the panel → close
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 900,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div style={{
        background: t.surface, borderRadius: 18, padding: "22px 22px",
        width: "100%", maxWidth: 440, border: `1px solid ${t.border}`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        animation: "fadeUp 0.22s ease",
      }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: t.text }}>
            {isEdit ? "Edit Transaction" : "New Transaction"}
          </h2>
          <button onClick={onClose} style={{
            background: t.surfaceUp, border: `1px solid ${t.border}`,
            borderRadius: 8, padding: "5px 7px", cursor: "pointer", display: "flex",
          }}>
            {/* × icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.textSec} strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Income / Expense toggle */}
        <div style={{
          display: "flex", background: t.bgAlt, borderRadius: 10, padding: 3,
          marginBottom: 16, border: `1px solid ${t.border}`,
        }}>
          {["expense", "income"].map((tp) => (
            <button key={tp} onClick={() => switchType(tp)} style={{
              flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12,
              fontWeight: 800, border: "none", cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s",
              background: form.type === tp ? (tp === "income" ? t.green : t.red) : "transparent",
              color: form.type === tp ? "#000" : t.textSec,
            }}>
              {tp === "income" ? "↑ Income" : "↓ Expense"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Description */}
          <div>
            <label style={{ display: "block", fontSize: 10, color: t.textSec, marginBottom: 5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Description
            </label>
            <input
              value={form.description} placeholder="e.g. Monthly Rent"
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              style={inp("description")}
              onFocus={(e) => (e.target.style.borderColor = t.accent)}
              onBlur={(e)  => (e.target.style.borderColor = errors.description ? t.red : t.border)}
            />
            {errors.description && <span style={{ color: t.red, fontSize: 10, marginTop: 3, display: "block" }}>{errors.description}</span>}
          </div>

          {/* Amount + Date side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, color: t.textSec, marginBottom: 5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Amount (₹)
              </label>
              <input type="number" min="1" value={form.amount} placeholder="0"
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                style={inp("amount")}
                onFocus={(e) => (e.target.style.borderColor = t.accent)}
                onBlur={(e)  => (e.target.style.borderColor = errors.amount ? t.red : t.border)}
              />
              {errors.amount && <span style={{ color: t.red, fontSize: 10, marginTop: 3, display: "block" }}>{errors.amount}</span>}
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: t.textSec, marginBottom: 5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Date
              </label>
              <input type="date" value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                style={inp("date")}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={{ display: "block", fontSize: 10, color: t.textSec, marginBottom: 5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Category
            </label>
            <select value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              style={{ ...inp("category"), appearance: "none", cursor: "pointer" }}>
              {cats.map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 12, fontWeight: 700,
            border: `1px solid ${t.border}`, background: "transparent",
            color: t.textSec, cursor: "pointer", fontFamily: "inherit",
          }}>
            Cancel
          </button>
          <button onClick={submit} style={{
            flex: 2, padding: "10px 0", borderRadius: 10, fontSize: 12, fontWeight: 900,
            border: "none", background: t.accent, color: "#fff",
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: `0 4px 16px ${t.accentSoft}`,
          }}>
            {isEdit ? "Save Changes" : "Add Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}
