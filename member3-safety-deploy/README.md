# Member 3 — Safety, Gamification & Deployment

You own the safety/idling panel, the leaderboard, and getting the whole
merged app onto AWS EC2 for the demo. Start the deployment scripts early
(Hour 1-ish) even though they're only needed at Hour 12 — provisioning
an EC2 box and getting Nginx working always takes longer than expected,
and you don't want it blocking the Hour 12-14 rehearsal slot.

## Tasks

1. **Safety/idling panel**: live, cost-quantified idling figure (dollars,
   not just minutes — pull the rate from an env var so it's easy to
   tweak for the demo) plus fake seatbelt/proximity toggle buttons that
   emit rule-trigger events (these feed Member 2's nudge flow — coordinate
   the trigger payload shape with them).
2. **Streak/leaderboard component**: reads from
   `GET /api/leaderboard` and `GET /api/safety-score/{operator_id}`
   per [`../CONTRACT.md`](../CONTRACT.md) — frame it positively (streaks,
   not violation counts), per the plan.
3. **`mock_safety_server.py`**: REST endpoints matching the contract
   above, backed by an in-memory or SQLite store, so the panel and
   leaderboard are demoable before the real backend's SQLite tables
   exist.
4. **Deployment** (`deploy/`):
   - `nginx.conf` template — reverse-proxies the React build and both
     the WebSocket and REST traffic to the backend.
   - EC2 setup notes/script — Ubuntu, Python, Node, Nginx, and the
     `systemd` unit that keeps Uvicorn running.
5. **End-to-end rehearsal**: once everything's deployed, run the full
   demo flow against the live EC2 instance, not just localhost — that's
   where WebSocket-under-real-network-conditions issues show up.

## Local run

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python mock_safety_server.py
```
