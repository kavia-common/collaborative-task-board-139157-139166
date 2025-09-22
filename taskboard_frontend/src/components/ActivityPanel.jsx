import React from "react";
import { oceanTheme } from "../theme";

/**
 * PUBLIC_INTERFACE
 * ActivityPanel
 * Shows recent activity and comments for collaboration context.
 */
export default function ActivityPanel({ activity = [] }) {
  return (
    <aside style={{
      width: 320,
      borderLeft: `1px solid ${oceanTheme.colors.border}`,
      background: oceanTheme.colors.surface,
      padding: 12,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }}>
      <div style={{ fontWeight: 800, color: oceanTheme.colors.text }}>Activity</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, overflow: "auto" }}>
        {activity.length === 0 && (
          <div style={{
            border: `1px dashed ${oceanTheme.colors.border}`,
            borderRadius: 12,
            padding: 16,
            color: oceanTheme.colors.mutedText
          }}>
            No activity yet. Updates will appear here in real-time.
          </div>
        )}
        {activity.map((item) => (
          <div key={item.id} style={{
            border: `1px solid ${oceanTheme.colors.border}`,
            background: "#fff",
            borderRadius: 12,
            padding: 12,
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
          }}>
            <div style={{ fontSize: 13, color: oceanTheme.colors.mutedText }}>{new Date(item.created_at).toLocaleString()}</div>
            <div style={{ marginTop: 6, color: oceanTheme.colors.text }}>{item.message}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
