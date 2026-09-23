"""
Mock LLM/nudge server — Member 2.

Stands in for the real Claude-powered alert generation from Phase 2.
POST a rule-trigger payload to /mock/nudge and get back an "alert"
message in the exact shape defined in ../CONTRACT.md. Swap this for the
real backend endpoint at integration time.

Run:
    pip install -r requirements.txt
    python mock_llm_server.py
"""

import uuid

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class RuleTrigger(BaseModel):
    rule: str  # e.g. "extended_idling", "unfastened_seatbelt", "single_load_cycle"
    minutes: int | None = None


# Canned responses per rule, standing in for the real Claude call.
# The real backend generates these dynamically; this just needs to match
# the CONTRACT.md shape closely enough to build and demo the voice flow.
CANNED_ALERTS = {
    "extended_idling": {
        "message": "You've been idling for {minutes} minutes — want to log a delay or shut down?",
        "requires_response": True,
        "response_options": ["Machine fault", "Waiting on dump truck", "Taking a break"],
        "severity": "warning",
    },
    "unfastened_seatbelt": {
        "message": "Seatbelt's unfastened — buckle up before you continue.",
        "requires_response": False,
        "response_options": None,
        "severity": "critical",
    },
    "single_load_cycle": {
        "message": "Only one load cycle this hour — is the site backed up, or is something slowing you down?",
        "requires_response": True,
        "response_options": ["Site backed up", "Equipment issue", "No issue"],
        "severity": "info",
    },
}


@app.post("/mock/nudge")
def generate_nudge(trigger: RuleTrigger):
    template = CANNED_ALERTS.get(
        trigger.rule,
        {
            "message": "Noticed something worth a check — how's it going?",
            "requires_response": False,
            "response_options": None,
            "severity": "info",
        },
    )
    message = template["message"]
    if trigger.minutes is not None:
        message = message.format(minutes=trigger.minutes)

    return {
        "type": "alert",
        "id": f"alert-{uuid.uuid4().hex[:8]}",
        "severity": template["severity"],
        "message": message,
        "requires_response": template["requires_response"],
        "response_options": template["response_options"],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8002)
