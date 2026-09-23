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

## Env var for backend URL

Use a single env var (e.g. `VITE_BACKEND_WS_URL`) so switching from the
mock to the real backend at the Hour 10 integration point is a one-line
change, not a code change.

## Local run

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python mock_server.py
```
