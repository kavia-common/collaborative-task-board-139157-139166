import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { oceanTheme } from "./theme";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import ActivityPanel from "./components/ActivityPanel";
import Board from "./components/Board";
import { getSupabaseClient, signInAnonymously } from "./lib/supabaseClient";
import { fetchInitialData, recordActivity, subscribeActivity, upsertTask } from "./services/boardService";
import { v4 as uuidv4 } from "uuid";

/**
 * PUBLIC_INTERFACE
 * App
 * Root application component. Provides the layout:
 * - Top bar with actions
 * - Sidebar for boards
 * - Main board area (drag-and-drop)
 * - Right panel for activity/comments
 * Integrates Supabase for realtime sync and uses Ocean Professional theme.
 */
function App() {
  const [theme] = useState("light");
  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);

  // Apply light theme token via document attribute for base template compatibility
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Initialize Supabase session (anonymous for demo)
  useEffect(() => {
    signInAnonymously().then(() => {
      // eslint-disable-next-line no-console
      console.log("Supabase session ready (anon or current)");
    });
  }, []);

  // Load initial data and subscribe to activity for the default/first board
  useEffect(() => {
    const init = async () => {
      const supabase = getSupabaseClient();
      // pick first board or create a local default if none exist
      let initialBoardId = activeBoardId;

      if (!initialBoardId) {
        const { data: boardsData } = await supabase.from("boards").select("*").order("created_at", { ascending: true });
        if (boardsData && boardsData.length > 0) {
          initialBoardId = boardsData[0].id;
          setBoards(boardsData);
          setActiveBoardId(initialBoardId);
        } else {
          // If no boards exist, create a light placeholder to display UI.
          setBoards([{ id: "local-default", name: "My Board (local)", created_at: new Date().toISOString() }]);
          setActiveBoardId("local-default");
        }
      }

      if (initialBoardId) {
        const { boards: loadedBoards, tasks: loadedTasks } = await fetchInitialData(initialBoardId);
        if (loadedBoards && loadedBoards.length) setBoards(loadedBoards);
        setTasks(loadedTasks || []);
      }
    };
    init();
  }, []); // first load only

  // Subscribe to activity for selected board
  useEffect(() => {
    if (!activeBoardId) return;
    const supabase = getSupabaseClient();
    let cancel = () => {};
    (async () => {
      const { data: existing } = await supabase.from("activity").select("*").eq("board_id", activeBoardId).order("created_at", { ascending: false }).limit(30);
      setActivity(existing || []);
      cancel = subscribeActivity(activeBoardId, (payload) => {
        if (payload.eventType === "INSERT") {
          setActivity((prev) => [payload.new, ...prev]);
        }
      });
    })();
    return () => cancel && cancel();
  }, [activeBoardId]);

  const onAddTask = async () => {
    if (!activeBoardId) return;
    const newTask = {
      id: uuidv4(),
      board_id: activeBoardId,
      title: "New Task",
      description: "Describe this task...",
      status: "todo",
      priority: "medium",
      position: (tasks?.filter(t => t.status === "todo")?.length || 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    // Optimistic UI
    setTasks(prev => [newTask, ...prev]);
    try {
      await upsertTask(newTask);
      await recordActivity(activeBoardId, `Added task: ${newTask.title}`, { task_id: newTask.id });
    } catch (e) {
      // Revert on failure
      setTasks(prev => prev.filter(t => t.id !== newTask.id));
      // eslint-disable-next-line no-console
      console.error("Failed to add task:", e);
    }
  };

  const onAddBoard = async () => {
    const supabase = getSupabaseClient();
    const payload = { name: `Board ${boards.length + 1}` };
    try {
      const { data, error } = await supabase.from("boards").insert(payload).select("*").single();
      if (error) throw error;
      setBoards(prev => [...prev, data]);
      setActiveBoardId(data.id);
      await recordActivity(data.id, `Created board: ${data.name}`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to create board:", e);
    }
  };

  const onSelectBoard = (id) => setActiveBoardId(id);

  const onLocalMove = (updatedTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
  };

  const layoutStyle = useMemo(() => ({
    display: "grid",
    gridTemplateColumns: "260px 1fr 320px",
    gridTemplateRows: "auto 1fr",
    gridTemplateAreas: `
      "topbar topbar topbar"
      "sidebar main activity"
    `,
    height: "100vh",
    background: oceanTheme.colors.background,
    color: oceanTheme.colors.text
  }), []);

  return (
    <div style={layoutStyle}>
      <div style={{ gridArea: "topbar" }}>
        <TopBar onAddTask={onAddTask} onAddBoard={onAddBoard} />
      </div>
      <div style={{ gridArea: "sidebar", overflow: "auto" }}>
        <Sidebar boards={boards} activeBoardId={activeBoardId} onSelectBoard={onSelectBoard} />
      </div>
      <main style={{ gridArea: "main", overflow: "hidden" }}>
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${oceanTheme.colors.border}`, background: "#fff" }}>
            <div style={{ fontWeight: 800 }}>{(boards.find(b => b.id === activeBoardId)?.name) || "Board"}</div>
          </div>
          <div style={{ flex: 1, overflow: "auto", background: oceanTheme.gradient }}>
            {/* Avoid rendering Board until we have a concrete activeBoardId to prevent transient unmounts */}
            {activeBoardId ? (
              <>
                {console.log("[App] Rendering Board with activeBoardId:", activeBoardId, "taskCount:", tasks?.length || 0)}
                <Board boardId={activeBoardId} tasks={tasks} onLocalMove={onLocalMove} />
              </>
            ) : (
              <div style={{ padding: 16, color: oceanTheme.colors.mutedText }}>
                Initializing board...
              </div>
            )}
          </div>
        </div>
      </main>
      <div style={{ gridArea: "activity", overflow: "auto" }}>
        <ActivityPanel activity={activity} />
      </div>
    </div>
  );
}

export default App;
