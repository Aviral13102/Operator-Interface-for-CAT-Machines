# Operator Interface for CAT Machines — CAT Spotter, Phase 3

This repo covers **Phase 3** of the CAT Spotter build: the operator-facing
interface. Phases 1 (telemetry pipeline + Random Forest task-time model)
and 2 (rule-based safety engine + Claude-powered nudges) are complete in
the main project; this repo is where the three of us build the UI that
sits on top of them, in parallel, without blocking on each other.

## How the three workstreams fit together

Everyone codes against **[`CONTRACT.md`](./CONTRACT.md)** — the exact
JSON shapes the real backend sends and expects. As long as your component
consumes/produces those shapes, it doesn't matter that the real backend
isn't finished yet: each of us ships a tiny local mock server that speaks
the same contract, builds and tests against that, and at integration time
we just repoint the app at the real backend URL instead of the mock. No
component code should need to change at integration time — only a config
value.

```
                    ┌─────────────────────────┐
                    │   Shared React shell     │  ← Member 1
                    │  (WebSocket client,      │
                    │   routing, state)        │
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
     Voice nudge UI      Safety/idling panel   Leaderboard + streaks
       (Member 2)            (Member 3)            (Member 3)
              │                  │                  │
              ▼                  ▼                  ▼
     mock_llm_server.py  mock_safety_server.py  (same server)
     (Member 2's stub)      (Member 3's stub)
```

Member 1's shell is the integration point — it owns the WebSocket
connection and passes typed messages down to Member 2's and Member 3's
components as props/context. That's the one seam that needs a 15-minute
sync early on (see Hour 1 below) so the props interface is agreed before
anyone builds against it.

## Team split

| Member | Owns | Folder |
|---|---|---|
| 1 | Core app shell, real-time data layer, current-task view | `member1-core-shell/` |
| 2 | Voice interaction (STT/TTS), conversational nudge UI | `member2-voice-module/` |
| 3 | Safety/idling dashboard, gamification, deployment | `member3-safety-deploy/` |

Each folder has its own `README.md` with that member's task list and a
`requirements.txt` for their local mock server's Python dependencies.
The root [`requirements.txt`](./requirements.txt) is the union of all
three, pinned to the same versions, so the merged system installs
cleanly in one environment. Root [`package.json`](./package.json) is the
single source of truth for the shared React app's JS dependencies —
everyone installs from it rather than adding packages ad hoc.

## Timeline (remaining ~15 hours)

**Hour 0–1 — Sync (all three, 15–20 min)**
Confirm the prop/context shape Member 1's shell exposes (`telemetry`,
`alerts`, `sendVoiceResponse()`), agree on it in `CONTRACT.md` if it
needs changing, then split off and build independently.

**Hour 1–8 — Independent build**
- Member 1: Vite React scaffold, WebSocket hook, current-task view,
  `mock_server.py` replaying the CSV.
- Member 2: Web Speech API hook, nudge UI, `mock_llm_server.py`
  returning canned alerts.
- Member 3: safety/idling panel, leaderboard UI, `mock_safety_server.py`,
  plus starting on the Nginx/EC2 deployment scripts in parallel.

**Hour 8–10 — Internal integration**
Merge all three branches into `main` against the mock servers first,
so integration bugs show up before the real backend is even in the
loop. Fix prop/contract mismatches here, not later.

**Hour 10–12 — Swap mocks for the real backend**
Point the WebSocket client and REST calls at the real Phase 1/2
service URLs. Because everyone built to `CONTRACT.md`, this should be
a config change, not a rewrite.

**Hour 12–14 — Deploy + rehearse**
Member 3 deploys the merged app to AWS EC2 behind Nginx. Full run-through
of the demo script, fix anything that breaks under real network
conditions (WebSocket reconnect handling is the likely culprit).

**Hour 14–15 — Buffer**
Reserved for whatever actually goes wrong — don't schedule real work
here.

## Git workflow

- Branch per member: `member1-core-shell`, `member2-voice-module`,
  `member3-safety-deploy`.
- Small, frequent commits — easier to unpick a bad merge at hour 9 than
  a giant diff.
- Merge to `main` at the Hour 8 checkpoint above, not continuously —
  fewer surprise conflicts while everyone's heads-down.

## Environment setup

```bash
# Frontend (everyone)
npm install

# Your own mock server (pick your folder)
cd member1-core-shell   # or member2-voice-module / member3-safety-deploy
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Once merged, the combined backend environment:
pip install -r requirements.txt   # root-level, union of all three
```
