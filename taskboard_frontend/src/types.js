export const defaultColumns = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" }
];

// Log once on module load to verify column ids are as expected.
// eslint-disable-next-line no-console
console.log("[types] defaultColumns loaded:", defaultColumns.map(c => c.id));

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
  const order = defaultColumns.map(c => c.id);
  // eslint-disable-next-line no-console
  console.log("[types] columnOrderFromDefaults:", order);
  return order;
}
