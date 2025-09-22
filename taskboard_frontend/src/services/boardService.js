import { getSupabaseClient } from "../lib/supabaseClient";

/**
 * PUBLIC_INTERFACE
 * subscribeTasks
 * Subscribes to realtime changes on tasks table for given boardId.
 * Returns unsubscribe function.
 */
export function subscribeTasks(boardId, onChange) {
  /** Subscribe to insert/update/delete on tasks related to a board. */
  const supabase = getSupabaseClient();
  const channel = supabase
    .channel(`tasks-board-${boardId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tasks", filter: `board_id=eq.${boardId}` },
      (payload) => onChange && onChange(payload)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * PUBLIC_INTERFACE
 * fetchInitialData
 * Loads boards, tasks, and minimal meta needed to render UI.
 */
export async function fetchInitialData(activeBoardId) {
  const supabase = getSupabaseClient();
  const [{ data: boards }, { data: tasks }] = await Promise.all([
    supabase.from("boards").select("*").order("created_at", { ascending: true }),
    supabase.from("tasks").select("*").eq("board_id", activeBoardId).order("position", { ascending: true })
  ]);
  return { boards: boards || [], tasks: tasks || [] };
}

/**
 * PUBLIC_INTERFACE
 * upsertTask
 * Create or update a task row.
 */
export async function upsertTask(task) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("tasks").upsert(task).select("*").single();
  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * moveTask
 * Update task status and position on drag-and-drop.
 */
export async function moveTask(taskId, newStatus, newPosition) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ status: newStatus, position: newPosition, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * recordActivity
 * Inserts an activity/comment row for the right panel feed.
 */
export async function recordActivity(boardId, message, metadata = {}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("activity")
    .insert({ board_id: boardId, message, metadata })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * subscribeActivity
 * Real-time activity feed subscription.
 */
export function subscribeActivity(boardId, onChange) {
  const supabase = getSupabaseClient();
  const channel = supabase
    .channel(`activity-board-${boardId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "activity", filter: `board_id=eq.${boardId}` },
      (payload) => onChange && onChange(payload)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
