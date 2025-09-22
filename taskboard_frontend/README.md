# Collaborative Task Board - Frontend

Modern React app implementing a real-time collaborative task board with drag-and-drop, Supabase integration, and the Ocean Professional theme.

## Features

- Drag-and-drop task board (react-beautiful-dnd)
- Real-time collaboration via Supabase Realtime
- Progress tracking across To Do / In Progress / Review / Done
- Sidebar navigation for boards
- Top bar for workspace actions
- Right panel activity feed
- Modern Ocean Professional theme (blue primary, amber accents, soft gradients)

## Environment Variables

Create a `.env` file at the project root (same folder as package.json) with:

```
REACT_APP_SUPABASE_URL=YOUR_SUPABASE_URL
REACT_APP_SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY
```

See `.env.example` for reference.

Note: Do not commit secrets. These variables must be provided by the environment.

## Supabase Schema (expected)

Tables used by the frontend:

- boards: { id: uuid, name: text, created_at: timestamptz }
- tasks: { id: uuid, board_id: uuid, title: text, description: text, status: text, priority: text, position: int4, created_at: timestamptz, updated_at: timestamptz }
- activity: { id: uuid, board_id: uuid, message: text, metadata: jsonb, created_at: timestamptz }

Enable Realtime for tasks and activity tables.

## Getting Started

Install dependencies:
```
npm install
```

Run development server:
```
npm start
```

Open http://localhost:3000 in your browser.

## Notes

- Authentication: For demo purposes, the app attempts to use an existing Supabase session if available; you can integrate a proper login flow by replacing `signInAnonymously` in `src/lib/supabaseClient.js`.
- Styling: Theme tokens are defined in `src/theme.js`. Components use inline styles for clarity.
- Extensibility: Add more columns, comments on tasks, user presence, and board permissions as needed.
