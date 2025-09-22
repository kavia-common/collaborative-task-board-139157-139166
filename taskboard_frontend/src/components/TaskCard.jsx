import React from "react";
import { oceanTheme } from "../theme";

/**
 * PUBLIC_INTERFACE
 * TaskCard
 * Displays a single task in a column with priority chip.
 */
export default function TaskCard({ task }) {
  const colorByPriority = {
    low: "#10B981",
    medium: oceanTheme.colors.secondary,
    high: "#EF4444"
  };
  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${oceanTheme.colors.border}`,
      borderRadius: 14,
      padding: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ fontWeight: 700, color: oceanTheme.colors.text }}>{task.title}</div>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#fff",
          background: colorByPriority[task.priority] || oceanTheme.colors.secondary,
          padding: "4px 8px",
          borderRadius: 999
        }}>
          {task.priority || "medium"}
        </span>
      </div>
      {task.description && (
        <div style={{ fontSize: 13, color: oceanTheme.colors.mutedText, marginTop: 6 }}>
          {task.description}
        </div>
      )}
    </div>
  );
}
