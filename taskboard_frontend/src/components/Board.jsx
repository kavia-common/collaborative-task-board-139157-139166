import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";
import { oceanTheme } from "../theme";
import { defaultColumns, columnOrderFromDefaults } from "../types";
import { moveTask, subscribeTasks, upsertTask } from "../services/boardService";

/**
 * PUBLIC_INTERFACE
 * Board
 * Drag-and-drop task board with real-time syncing.
 */
export default function Board({ boardId, tasks = [], onLocalMove }) {
  const [localTasks, setLocalTasks] = useState(tasks);

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

  const onDragEnd = useCallback(async (result) => {
    const { destination, source, draggableId } = result || {};
    if (!destination || !source) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

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
  }, [tasksByColumn, onLocalMove, tasks]);

  const columnOrder = useMemo(() => columnOrderFromDefaults(), []);

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
      <DragDropContext onDragEnd={onDragEnd}>
        {columnOrder.map((colId) => {
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
