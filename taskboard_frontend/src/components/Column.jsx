import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import TaskCard from "./TaskCard";
import { oceanTheme } from "../theme";

/**
 * PUBLIC_INTERFACE
 * Column
 * A board column that accepts drag-and-drop tasks.
 */
export default function Column({ column, tasks }) {
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
      <div style={{ fontWeight: 800, color: oceanTheme.colors.text }}>{column.title}</div>
      <Droppable droppableId={column.id}>
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
            {(tasks || []).map((task, index) => (
              <Draggable draggableId={String(task.id)} index={index} key={task.id}>
                {(dragProvided) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                  >
                    <TaskCard task={task} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
