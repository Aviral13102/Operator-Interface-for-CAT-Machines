"""
Mock safety/leaderboard server — Member 3.

Stands in for the real backend's SQLite-backed safety score and
leaderboard endpoints, in the shapes defined in ../CONTRACT.md. Swap
for the real backend URL at integration time.

Run:
    pip install -r requirements.txt
    python mock_safety_server.py
"""

from fastapi import FastAPI, HTTPException

app = FastAPI()

# In-memory stand-in for the real SQLite-backed store.
SAFETY_SCORES = {
    "OP-22": {"current_streak_days": 6, "idling_cost_today_usd": 18.40, "safety_events_today": 1},
    "OP-11": {"current_streak_days": 4, "idling_cost_today_usd": 9.10, "safety_events_today": 0},
}

LEADERBOARD = [
    {"operator_id": "OP-22", "name": "R. Menon", "streak_days": 6},
    {"operator_id": "OP-11", "name": "S. Patil", "streak_days": 4},
]


@app.get("/api/safety-score/{operator_id}")
def get_safety_score(operator_id: str):
    score = SAFETY_SCORES.get(operator_id)
    if score is None:
        raise HTTPException(status_code=404, detail="operator not found")
    return {"operator_id": operator_id, **score}


@app.get("/api/leaderboard")
def get_leaderboard():
    return LEADERBOARD


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8003)
