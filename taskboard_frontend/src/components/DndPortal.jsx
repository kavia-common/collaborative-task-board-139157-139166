import React from "react";
import ReactDOM from "react-dom";

/**
 * PUBLIC_INTERFACE
 * DndPortal
 * Provides a React portal target for react-beautiful-dnd Draggable items.
 * This helps avoid layout/overflow clipping and ensures registration stability.
 */
export function getOrCreateDndPortal() {
  let portal = document.getElementById("dnd-portal");
  if (!portal) {
    portal = document.createElement("div");
    portal.setAttribute("id", "dnd-portal");
    // Positioning to overlay the app; pointer-events none so underlying elements can still receive events
    portal.style.position = "fixed";
    portal.style.pointerEvents = "none";
    portal.style.top = "0";
    portal.style.left = "0";
    portal.style.width = "100%";
    portal.style.height = "100%";
    portal.style.zIndex = "9999";
    document.body.appendChild(portal);
  }
  return portal;
}

// PUBLIC_INTERFACE
export function DndPortal({ children }) {
  /** Renders children into the global DnD portal. */
  const mountNode = getOrCreateDndPortal();
  return ReactDOM.createPortal(children, mountNode);
}
