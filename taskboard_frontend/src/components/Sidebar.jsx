import React from "react";
import { oceanTheme } from "../theme";

/**
 * PUBLIC_INTERFACE
 * Sidebar
 * Displays boards and teams with selection state.
 */
export default function Sidebar({ boards, activeBoardId, onSelectBoard }) {
  return (
    <aside style={{
      width: 260,
      borderRight: `1px solid ${oceanTheme.colors.border}`,
      background: oceanTheme.colors.surface,
      padding: 12,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }}>
      <div style={{ color: oceanTheme.colors.mutedText, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
        Boards
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(boards || []).map((b) => (
          <button
            key={b.id}
            onClick={() => onSelectBoard(b.id)}
            style={{
              textAlign: "left",
              background: b.id === activeBoardId ? oceanTheme.gradient : "#fff",
              border: `1px solid ${oceanTheme.colors.border}`,
              borderRadius: 12,
              padding: "10px 12px",
              cursor: "pointer",
              fontWeight: 600,
              color: oceanTheme.colors.text
            }}
          >
            {b.name || "Untitled Board"}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 12, color: oceanTheme.colors.mutedText, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
        Teams
      </div>
      <div style={{ fontSize: 14, color: oceanTheme.colors.mutedText }}>
        Coming soon
      </div>
    </aside>
  );
}
