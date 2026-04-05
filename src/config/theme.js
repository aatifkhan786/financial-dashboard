// ─── Design Tokens ───────────────────────────────────────────────────────────
// Completely violet-first palette. All components consume `t` (theme object).
// Switching isDark = one state change, zero refactor needed anywhere.
// ─────────────────────────────────────────────────────────────────────────────

export const THEMES = {
  dark: {
    // Page backgrounds — layered depth
    bg:            "#07080F",
    bgDeep:        "#050608",
    surface:       "#0E1018",
    surfaceRaised: "#141720",
    surfaceHover:  "#1A1E2C",
    glass:         "rgba(14,16,24,0.85)",

    // Borders
    border:        "rgba(255,255,255,0.06)",
    borderMed:     "rgba(255,255,255,0.12)",
    borderBright:  "rgba(255,255,255,0.20)",

    // Text
    text:          "#F0F2FF",
    textSec:       "#7880A0",
    textMuted:     "#363C54",

    // Brand accent — violet
    accent:        "#7C6FFF",
    accentBright:  "#9B90FF",
    accentSoft:    "rgba(124,111,255,0.14)",
    accentGlow:    "rgba(124,111,255,0.08)",

    // Semantic colors
    green:         "#00D97E",
    greenSoft:     "rgba(0,217,126,0.12)",
    greenGlow:     "rgba(0,217,126,0.06)",

    red:           "#FF5A5A",
    redSoft:       "rgba(255,90,90,0.12)",
    redGlow:       "rgba(255,90,90,0.06)",

    amber:         "#FFB547",
    amberSoft:     "rgba(255,181,71,0.12)",

    blue:          "#4DA8FF",
    blueSoft:      "rgba(77,168,255,0.12)",

    teal:          "#00D9C8",
    tealSoft:      "rgba(0,217,200,0.12)",

    pink:          "#FF6EC7",
    pinkSoft:      "rgba(255,110,199,0.12)",

    // Chart
    grid:          "rgba(255,255,255,0.04)",
    axis:          "#1F2438",

    isDark: true,
  },

  light: {
    bg:            "#F0F2FF",
    bgDeep:        "#E6E9FF",
    surface:       "#FFFFFF",
    surfaceRaised: "#F8F9FF",
    surfaceHover:  "#F2F4FF",
    glass:         "rgba(255,255,255,0.90)",

    border:        "rgba(0,0,0,0.07)",
    borderMed:     "rgba(0,0,0,0.13)",
    borderBright:  "rgba(0,0,0,0.22)",

    text:          "#0A0C18",
    textSec:       "#4A5070",
    textMuted:     "#A0A8C8",

    accent:        "#5B4FD4",
    accentBright:  "#7C70F0",
    accentSoft:    "rgba(91,79,212,0.10)",
    accentGlow:    "rgba(91,79,212,0.05)",

    green:         "#00A85F",
    greenSoft:     "rgba(0,168,95,0.10)",
    greenGlow:     "rgba(0,168,95,0.05)",

    red:           "#D63434",
    redSoft:       "rgba(214,52,52,0.10)",
    redGlow:       "rgba(214,52,52,0.05)",

    amber:         "#D4891A",
    amberSoft:     "rgba(212,137,26,0.10)",

    blue:          "#1A6ED4",
    blueSoft:      "rgba(26,110,212,0.10)",

    teal:          "#009B8F",
    tealSoft:      "rgba(0,155,143,0.10)",

    pink:          "#C4389E",
    pinkSoft:      "rgba(196,56,158,0.10)",

    grid:          "rgba(0,0,0,0.04)",
    axis:          "#D0D4E8",

    isDark: false,
  },
};
