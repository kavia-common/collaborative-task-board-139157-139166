import React, { useMemo, useState } from "react";
import { oceanTheme } from "../theme";

/**
 * PUBLIC_INTERFACE
 * TaskCard
 * Displays and edits a single task. Inline editing supports title, description, and priority.
 * Props:
 * - task: Task object
 * - onEdit: function(updatedTask) -> void (called when saving edits)
 */
export default function TaskCard({ task, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [local, setLocal] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "medium",
  });

  const colorByPriority = useMemo(() => ({
    low: "#10B981",
    medium: oceanTheme.colors.secondary,
    high: "#EF4444"
  }), []);

  const startEdit = () => {
    setLocal({
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "medium",
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveEdit = () => {
    const updated = {
      ...task,
      title: local.title.trim() || "Untitled",
      description: local.description,
      priority: local.priority || "medium",
      updated_at: new Date().toISOString()
    };
    onEdit && onEdit(updated);
    setIsEditing(false);
  };

  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${oceanTheme.colors.border}`,
      borderRadius: 14,
      padding: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    }}>
      {!isEditing ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div style={{ fontWeight: 700, color: oceanTheme.colors.text }}>{task.title || "Untitled"}</div>
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
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={startEdit} style={btnGhostSmall()}>Edit</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={local.title}
              onChange={(e) => setLocal(s => ({ ...s, title: e.target.value }))}
              placeholder="Task title"
              style={inputStyle()}
            />
            <select
              value={local.priority}
              onChange={(e) => setLocal(s => ({ ...s, priority: e.target.value }))}
              style={selectStyle()}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <textarea
            value={local.description}
            onChange={(e) => setLocal(s => ({ ...s, description: e.target.value }))}
            placeholder="Description"
            rows={3}
            style={{ ...inputStyle(), marginTop: 8, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={saveEdit} style={btnPrimarySmall()}>Save</button>
            <button onClick={cancelEdit} style={btnGhostSmall()}>Cancel</button>
          </div>
        </>
      )}
    </div>
  );
}

function btnPrimarySmall() {
  return {
    background: oceanTheme.colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "6px 10px",
    fontWeight: 600,
    cursor: "pointer",
  };
}

function btnGhostSmall() {
  return {
    background: "#fff",
    color: oceanTheme.colors.text,
    border: `1px solid ${oceanTheme.colors.border}`,
    borderRadius: 10,
    padding: "6px 10px",
    fontWeight: 600,
    cursor: "pointer",
  };
}

function inputStyle() {
  return {
    flex: 1,
    border: `1px solid ${oceanTheme.colors.border}`,
    borderRadius: 10,
    padding: "8px 10px",
    fontSize: 14,
  };
}

function selectStyle() {
  return {
    border: `1px solid ${oceanTheme.colors.border}`,
    borderRadius: 10,
    padding: "8px 10px",
    fontSize: 14,
    background: "#fff",
  };
}
