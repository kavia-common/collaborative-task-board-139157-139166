import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";
import { oceanTheme } from "../theme";
import { defaultColumns, columnOrderFromDefaults } from "../types";
import { moveTask, subscribeTasks } from "../services/boardService";

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
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const taskId = draggableId;
    const sourceTasks = Array.from(tasksByColumn[source.droppableId] || []);
    const [moved] = sourceTasks.splice(source.index, 1);

    const destTasks = Array.from(tasksByColumn[destination.droppableId] || []);
    destTasks.splice(destination.index, 0, moved);

    // compute new position: use index as position for simplicity
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

  return (
    <div style={{ display: "flex", gap: 14, padding: 14, overflow: "auto" }}>
      <DragDropContext onDragEnd={onDragEnd}>
        {columnOrder.map((colId) => {
          const column = defaultColumns.find(c => c.id === colId);
          const colTasks = tasksByColumn[colId] || [];
          return <Column key={colId} column={column} tasks={colTasks} />;
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
