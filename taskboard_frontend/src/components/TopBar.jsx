import React from "react";
import { oceanTheme } from "../theme";

/**
 * PUBLIC_INTERFACE
 * TopBar
 * Workspace top bar with actions (add task/board, search, theme toggle placeholder).
 */
export default function TopBar({ onAddTask, onAddBoard }) {
  return (
    <div style={{
      padding: "12px 16px",
      borderBottom: `1px solid ${oceanTheme.colors.border}`,
      background: oceanTheme.gradient,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 5
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `linear-gradient(135deg, ${oceanTheme.colors.primary} 0%, ${oceanTheme.colors.secondary} 100%)`,
          boxShadow: oceanTheme.shadow,
          display: "grid",
          placeItems: "center",
          color: "white",
          fontWeight: 800
        }}>TB</div>
        <div style={{ fontWeight: 700, color: oceanTheme.colors.text }}>Taskboard</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onAddTask} style={buttonPrimary()}>+ New Task</button>
        <button onClick={onAddBoard} style={buttonGhost()}>+ New Board</button>
      </div>
    </div>
  );
}

function buttonPrimary() {
  return {
    background: oceanTheme.colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: oceanTheme.shadow,
    transition: "transform .1s ease"
  };
}

function buttonGhost() {
  return {
    background: "#fff",
    color: oceanTheme.colors.text,
    border: `1px solid ${oceanTheme.colors.border}`,
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform .1s ease",
  };
}
