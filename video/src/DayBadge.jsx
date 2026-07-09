import React from "react";
import { COLORS, FONT } from "./theme.js";

// Pill badge: "DAY N". Used in the hook and as gameplay overlay.
export const DayBadge = ({ day, scale = 1, style = {} }) => (
  <div
    style={{
      display: "inline-block",
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: 44 * scale,
      letterSpacing: 6 * scale,
      color: COLORS.white,
      padding: `${14 * scale}px ${34 * scale}px`,
      border: `${3 * scale}px solid ${COLORS.accent}`,
      borderRadius: 999,
      backgroundColor: "rgba(122,140,255,0.12)",
      boxShadow: `0 0 ${30 * scale}px rgba(122,140,255,0.35)`,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    DAY {day}
  </div>
);
