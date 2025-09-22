import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";
import { oceanTheme } from "../theme";
import { defaultColumns, columnOrderFromDefaults } from "../types";
import { moveTask, subscribeTasks, upsertTask } from "../services/boardService";

/**
 * Note: React 18 StrictMode can double-invoke effects; ensure droppableIds are stable and consistent.
 * Columns are defined in src/types.js and Column renders a Droppable with droppableId matching column.id.
 * Draggables render through a portal for robust registration and layout across complex containers.
 * This file includes extensive logging and guards to diagnose "Cannot find droppable entry with id [todo]" errors.
 */

/**
 * PUBLIC_INTERFACE
 * Board
 * Drag-and-drop task board with real-time syncing.
 */
export default function Board({ boardId, tasks = [], onLocalMove }) {
  const [localTasks, setLocalTasks] = useState(tasks);
  const mountedRef = useRef(false);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Realtime subscription for this board
  useEffect(() => {
    if (!boardId) return;
    const unsubscribe = subscribeTasks(boardId, (payload) => {
      // Update local tasks based on event
      if (payload.eventType === "INSERT") {
        setLocalTasks(prev => [...prev, payload.new]);
      } else if (payload.eventType === "UPDATE") {
        setLocalTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
      } else if (payload.eventType === "DELETE") {
        setLocalTasks(prev => prev.filter(t => t.id !== payload.old.id));
      }
    });
    return () => unsubscribe && unsubscribe();
  }, [boardId]);

  useEffect(() => {
    mountedRef.current = true;
    // eslint-disable-next-line no-console
    console.log("[Board] Mounted with boardId:", boardId);
    return () => {
      mountedRef.current = false;
      // eslint-disable-next-line no-console
      console.log("[Board] Unmounted");
    };
  }, [boardId]);

  const tasksByColumn = useMemo(() => {
    const grouped = {};
    for (const col of defaultColumns) grouped[col.id] = [];
    for (const t of localTasks) {
      if (!grouped[t.status]) grouped[t.status] = [];
      grouped[t.status].push(t);
    }
    // sort by position if provided
    for (const key of Object.keys(grouped)) {
      grouped[key].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    }
    return grouped;
  }, [localTasks]);

  // Capture available droppableIds pre-render for diagnostics
  const columnOrder = useMemo(() => columnOrderFromDefaults(), []);
  const availableDroppableIds = useMemo(() => {
    // Always include all default columns to ensure registration order is deterministic
    return columnOrder.filter(Boolean);
  }, [columnOrder]);

  const onDragEnd = useCallback(async (result) => {
    const { destination, source, draggableId } = result || {};
    // eslint-disable-next-line no-console
    console.log("[DND] onDragEnd fired", { result });
    if (!destination || !source) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Log droppableIds known at drag time
    // eslint-disable-next-line no-console
    console.log("[DND] Available droppableIds at drag end:", availableDroppableIds);
    if (!availableDroppableIds.includes(source.droppableId)) {
      // eslint-disable-next-line no-console
      console.warn("[DND] Source droppableId not found among available ids:", source.droppableId, availableDroppableIds);
    }
    if (!availableDroppableIds.includes(destination.droppableId)) {
      // eslint-disable-next-line no-console
      console.warn("[DND] Destination droppableId not found among available ids:", destination.droppableId, availableDroppableIds);
    }

    const taskId = draggableId;
    const sourceList = Array.from(tasksByColumn[source.droppableId] || []);
    const [moved] = sourceList.splice(source.index, 1);
    if (!moved) return;

    // Insert into destination list (for future: compute positions based on neighbors if needed)
    const destList = Array.from(tasksByColumn[destination.droppableId] || []);
    destList.splice(destination.index, 0, moved);

    const newStatus = destination.droppableId;
    const newPosition = destination.index;

    // Optimistic UI update
    setLocalTasks(prev => prev.map(t => t.id === moved.id ? { ...t, status: newStatus, position: newPosition } : t));
    onLocalMove && onLocalMove({ ...moved, status: newStatus, position: newPosition });

    try {
      await moveTask(taskId, newStatus, newPosition);
    } catch (e) {
      // Revert on failure (basic)
      setLocalTasks(tasks);
      // eslint-disable-next-line no-console
      console.error("Failed to move task:", e);
    }
  }, [tasksByColumn, onLocalMove, tasks, availableDroppableIds]);

  // PUBLIC_INTERFACE
  const onEditTask = useCallback(async (updatedTask) => {
    // Optimistic
    setLocalTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
    onLocalMove && onLocalMove(updatedTask);
    try {
      await upsertTask(updatedTask);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to update task:", e);
    }
  }, [onLocalMove]);

  return (
    <div style={{ display: "flex", gap: 14, padding: 14, overflow: "auto" }}>
      {/* Log that all columns are rendered before DragDropContext children to ensure registration */}
      {/* eslint-disable-next-line no-console */}
      {console.log("[Board] Rendering columns:", availableDroppableIds)}
      <DragDropContext
        onDragEnd={onDragEnd}
        onDragStart={(start) => {
          // eslint-disable-next-line no-console
          console.log("[DND] onDragStart", { start, availableDroppableIds });
        }}
      >
        {availableDroppableIds.map((colId) => {
          const column = defaultColumns.find(c => c.id === colId);
          const colTasks = tasksByColumn[colId] || [];
          return <Column key={colId} column={column} tasks={colTasks} onEditTask={onEditTask} />;
        })}
      </DragDropContext>
      <div style={{
        minWidth: 180,
        height: "fit-content",
        padding: 14,
        border: `1px dashed ${oceanTheme.colors.border}`,
        color: oceanTheme.colors.mutedText,
        borderRadius: 14,
        background: "#fff"
      }}>
        + Add Column (coming soon)
      </div>
    </div>
  );
}
