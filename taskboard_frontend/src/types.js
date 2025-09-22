export const defaultColumns = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" }
];

export function createTask({ id, title, description = "", status = "todo", assignee = null, priority = "medium" }) {
  return {
    id,
    title,
    description,
    status, // column id
    assignee,
    priority,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export function columnOrderFromDefaults() {
  return defaultColumns.map(c => c.id);
}
