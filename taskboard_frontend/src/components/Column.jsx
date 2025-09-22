import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import TaskCard from "./TaskCard";
import { oceanTheme } from "../theme";
import { DndPortal } from "./DndPortal";

/**
 * PUBLIC_INTERFACE
 * Column
 * A board column that accepts drag-and-drop tasks.
 * Props:
 * - column: { id, title }
 * - tasks: task[]
 * - onEditTask: function(updatedTask)
 */
export default function Column({ column, tasks = [], onEditTask }) {
  const colId = String(column?.id || "");

  return (
    <div style={{
      minWidth: 280,
      maxWidth: 320,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      background: oceanTheme.colors.surface,
      border: `1px solid ${oceanTheme.colors.border}`,
      borderRadius: 16,
      padding: 12,
    }}>
      <div style={{ fontWeight: 800, color: oceanTheme.colors.text }}>{column?.title || "Column"}</div>
      {/* Ensure droppableId is a stable, non-empty string */}
      <Droppable droppableId={colId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              minHeight: 40,
              padding: 4,
              background: snapshot.isDraggingOver ? "rgba(37,99,235,0.06)" : "transparent",
              borderRadius: 12,
              transition: "background .15s ease"
            }}
          >
            {tasks.map((task, index) => (
              <Draggable draggableId={String(task.id)} index={index} key={String(task.id)}>
                {(dragProvided, dragSnapshot) => {
                  const content = (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                    >
                      <TaskCard task={task} onEdit={onEditTask} />
                    </div>
                  );
                  // When dragging, render into a portal to improve stability and avoid clipping/z-index issues
                  return dragSnapshot.isDragging ? <DndPortal>{content}</DndPortal> : content;
                }}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
