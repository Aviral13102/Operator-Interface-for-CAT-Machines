# Integration Contract

The one document everyone should agree on before writing component code.
If the real backend's shape ever needs to change, update it here first,
then update both the real backend and whichever mock server is affected.

## 1. WebSocket — `telemetry` message

Sent continuously by the backend (or `member1-core-shell/mock_server.py`
while developing) over the shared WebSocket connection.

```json
{
  "type": "telemetry",
  "timestamp": "2026-09-23T22:14:00Z",
  "machine_id": "EXC-104",
  "task_type": "Trenching",
  "weather": "Rainy",
  "operator_skill": "Intermediate",
  "machine_age_years": 6,
  "idling_time_min": 4,
  "load_cycles": 12,
  "seatbelt_fastened": true,
  "estimated_time_min": 42,
  "eta_min": 47,
  "eta_confidence_range_min": [43, 52]
}
```

## 2. WebSocket — `alert` message

Sent when the rule engine + LLM layer (or Member 2's `mock_llm_server.py`)
flags something. Member 2's UI renders and optionally speaks this.

```json
{
  "type": "alert",
  "id": "alert-8841",
  "severity": "warning",
  "message": "You've been idling for 15 minutes — want to log a delay or shut down?",
  "requires_response": true,
  "response_options": ["Machine fault", "Waiting on dump truck", "Taking a break"]
}
```

When the operator answers by voice, Member 2's client sends back:

```json
{
  "type": "alert_response",
  "alert_id": "alert-8841",
  "response": "Waiting on dump truck"
}
```

## 3. REST — `GET /api/safety-score/{operator_id}`

Backed by Member 3's `mock_safety_server.py` during development.

```json
{
  "operator_id": "OP-22",
  "current_streak_days": 6,
  "idling_cost_today_usd": 18.40,
  "safety_events_today": 1
}
```

## 4. REST — `GET /api/leaderboard`

```json
[
  { "operator_id": "OP-22", "name": "R. Menon", "streak_days": 6 },
  { "operator_id": "OP-11", "name": "S. Patil", "streak_days": 4 }
]
```

## 5. WebSocket — `training_recommendation` message

Sent when actual time significantly exceeds estimated time on a task type.

```json
{
  "type": "training_recommendation",
  "task_type": "Grading",
  "video_id": "vid-grading-02",
  "reason": "Actual time exceeded estimate by 34% on the last 3 Grading tasks"
}
```

## Rules for changing this file

- If your mock server's response shape drifts from what's written here,
  the contract wins — fix the mock, don't quietly diverge.
- Any change to a shape here after Hour 1 needs a one-line heads-up to
  the other two members before you push it.
