# Member 1 — Core Shell & Real-Time Data Layer

You own the app's skeleton and the one WebSocket connection everyone
else's data flows through. Ship this first — Members 2 and 3 build
their components against the props/context you expose, so the sooner
that shape is stable, the sooner they can build against the real thing
instead of guessing.

## Tasks

1. **Scaffold the React app** (Vite) at the repo root's `src/` — this is
   the shared app, not a folder-local one. Everyone's components land
   inside it.
2. **WebSocket hook** (`useTelemetry`): connects to the backend
   (mock or real, from an env var — see below), parses `telemetry` and
   `alert` messages per [`../CONTRACT.md`](../CONTRACT.md), exposes them
   via context.
3. **Current-task view**: live ETA with confidence range, task type,
   weather, operator skill — the single-screen focus the plan calls for,
   not a multi-tab dashboard.
4. **Reconnect handling**: the WebSocket will drop at least once during
   the real demo — handle it gracefully (retry with backoff, show a
   subtle "reconnecting" state) rather than a blank screen.
5. **`mock_server.py`**: replays the provided telemetry CSV over a
   WebSocket at `/ws`, one row every few seconds, in the exact shape
   `CONTRACT.md` specifies. This is what Members 2 and 3 — and you —
   develop against until the real Phase 1/2 backend is wired in.

---

## How to run (dev mode)

Open **two terminals** from this folder.

### Terminal 1 — Mock telemetry server (port 8001)

```bash
# First time only: create and activate a virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

pip install -r requirements.txt

# Start the mock server — listens on ws://localhost:8001/ws
python mock_server.py
# or equivalently:
uvicorn mock_server:app --host 0.0.0.0 --port 8001 --reload
```

The server will replay telemetry rows every 3 seconds.
If `sample_telemetry.csv` is not present it falls back to one hardcoded row.

### Terminal 2 — Vite dev server (port 5173)

```bash
# From the repo root (where package.json lives)
cd ..
npm install        # first time only
npm run dev
```

Open http://localhost:5173 — the Vite proxy forwards
`ws://localhost:5173/ws` → `ws://localhost:8001/ws` automatically.
You should see live telemetry appear within a few seconds.

---

## Env var for backend URL

Copy `.env.example` to `.env` (in this folder, or the repo root — Vite
reads both):

```bash
cp .env.example .env
```

During development the env var can be left blank; the Vite proxy handles it.
At integration time (Hour 10), set:

```
VITE_BACKEND_WS_URL=ws://your-ec2-host/ws
```

That one line is the only change needed to point the app at the real backend.

---

## File structure (Member 1's additions)

```
member1-core-shell/
├── index.html                       Vite entry HTML
├── vite.config.js                   Vite config — dev proxy for /ws and /api
├── .env.example                     Copy → .env, set VITE_BACKEND_WS_URL
├── mock_server.py                   FastAPI WS server on port 8001
├── requirements.txt                 Python deps for mock_server.py
└── src/
    ├── main.jsx                     React root mount
    ├── App.jsx                      Root component — mounts TelemetryProvider
    ├── index.css                    Global reset + CSS custom properties
    ├── context/
    │   └── TelemetryContext.jsx     React Context (owns the WS connection)
    ├── hooks/
    │   └── useTelemetry.js          Convenience hook for Member 1 components
    ├── lib/
    │   └── wsManager.js             Pure-JS WS manager (reconnect + subscribe)
    └── components/
        ├── ConnectionStatus/        "Live / Reconnecting… / Disconnected" badge
        ├── EtaDisplay/              Large ETA + confidence range (primary focus)
        ├── Slot/                    Composable placeholder for Members 2 & 3
        └── TaskDashboard/           Main full-viewport layout
```

---

## For Members 2 & 3 — how to plug in

### 1. Import the context hook

```js
// From anywhere inside src/
import { useTelemetryContext } from './context/TelemetryContext';

function YourComponent() {
  const {
    telemetry,          // latest CONTRACT.md telemetry object (or null)
    alerts,             // last 10 alert messages received
    connectionStatus,   // "connected" | "reconnecting" | "disconnected"
    sendMessage,        // send a payload over the shared WebSocket
    subscribe,          // subscribe to any message type (returns unsubscribe fn)
  } = useTelemetryContext();

  // ...
}
```

### 2. Sending an alert_response (Member 2)

Use `sendMessage` with the exact shape from CONTRACT.md §2:

```js
sendMessage({
  type:     "alert_response",
  alert_id: alert.id,       // string from the received alert
  response: "Waiting on dump truck",  // operator's chosen response
});
```

**Do not** add extra wrapper fields — the backend expects exactly this shape.

### 3. Drop your component into its Slot (TaskDashboard.jsx)

Find the two `<Slot>` elements in
`src/components/TaskDashboard/TaskDashboard.jsx` and add your component
as `children`:

```jsx
// Member 2
<Slot name="voice-nudge" label="[Member 2] Voice Nudge UI">
  <NudgePanel />     {/* ← your component */}
</Slot>

// Member 3
<Slot name="safety-panel" label="[Member 3] Safety / Idling Panel + Leaderboard">
  <SafetyPanel />    {/* ← your component */}
</Slot>
```

Once `children` is passed the dashed placeholder disappears automatically.

### 4. Subscribing to `training_recommendation` (or other types)

```js
useEffect(() => {
  const unsub = subscribe('training_recommendation', (msg) => {
    console.log('Training video suggested:', msg.video_id);
  });
  return unsub; // cleanup on unmount
}, [subscribe]);
```
