"""
Mock telemetry server — Member 1.

Replays the provided telemetry CSV over a WebSocket at /ws, one row at a
time, in the exact shape defined in ../CONTRACT.md ("telemetry" message).
Swap this for the real Phase 1/2 backend at integration time by changing
VITE_BACKEND_WS_URL — no frontend code should need to change.

Run:
    pip install -r requirements.txt
    python mock_server.py
"""

import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    pd = None
from fastapi import FastAPI, WebSocket
from fastapi.websockets import WebSocketDisconnect

app = FastAPI()

# Point this at the provided Caterpillar telemetry CSV once it's dropped in.
CSV_PATH = Path(__file__).parent / "sample_telemetry.csv"
REPLAY_DELAY_SECONDS = 3


def load_rows() -> list[dict]:
    if not CSV_PATH.exists():
        # Fallback sample so the mock runs before the real CSV is added.
        return [
            {
                "machine_id": "EXC-104",
                "task_type": "Trenching",
                "weather": "Rainy",
                "operator_skill": "Intermediate",
                "machine_age_years": 6,
                "idling_time_min": 4,
                "load_cycles": 12,
                "seatbelt_fastened": True,
                "estimated_time_min": 42,
            }
        ]
    if pd is not None:
        df = pd.read_csv(CSV_PATH)
        return df.to_dict(orient="records")
    else:
        return []


def to_telemetry_message(row: dict) -> dict:
    estimated = row.get("estimated_time_min", 40)
    return {
        "type": "telemetry",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "machine_id": row.get("machine_id", "UNKNOWN"),
        "task_type": row.get("task_type"),
        "weather": row.get("weather"),
        "operator_skill": row.get("operator_skill"),
        "machine_age_years": row.get("machine_age_years"),
        "idling_time_min": row.get("idling_time_min"),
        "load_cycles": row.get("load_cycles"),
        "seatbelt_fastened": bool(row.get("seatbelt_fastened", True)),
        "estimated_time_min": estimated,
        # Placeholder ETA math — replace with the real Random Forest
        # model's prediction once Phases 1/2 are wired in.
        "eta_min": estimated + 5,
        "eta_confidence_range_min": [estimated, estimated + 10],
    }


@app.websocket("/ws")
async def telemetry_feed(websocket: WebSocket):
    await websocket.accept()
    rows = load_rows()
    print(f"[mock_server] WebSocket accepted, replaying {len(rows)} rows", flush=True)
    try:
        while True:
            for row in rows:
                msg = json.dumps(to_telemetry_message(row))
                print(f"[mock_server] Sending: {msg[:80]}...", flush=True)
                await websocket.send_text(msg)
                await asyncio.sleep(REPLAY_DELAY_SECONDS)
    except WebSocketDisconnect:
        print("[mock_server] Client disconnected", flush=True)
    except Exception as e:
        print(f"[mock_server] ERROR in ws handler: {e}", flush=True)
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
