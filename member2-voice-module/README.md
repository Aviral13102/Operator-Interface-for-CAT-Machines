# Member 2 — Voice Interaction Module

You own the "voice-first" differentiator — the thing that makes this a
conversational co-pilot instead of another dashboard. Build against
Member 1's `alert` messages (see [`../CONTRACT.md`](../CONTRACT.md)), not
against the real Claude integration — `mock_llm_server.py` stands in for
that until Hour 10.

## Tasks

1. **`useVoice` hook**: wraps the Web Speech API — `SpeechRecognition`
   for input, `SpeechSynthesis` for output. Handle the "not supported in
   this browser" case explicitly (fall back to text input) since this
   will be demoed live and you don't want a silent failure on stage.
2. **Nudge UI component**: renders an incoming `alert` message as both a
   visual card and a spoken line. If `requires_response` is true, show
   the `response_options` and accept either a voice answer or a tap —
   voice can fail in a noisy demo room, so always keep the tap fallback.
3. **Response wiring**: when the operator answers, send the
   `alert_response` message shape from `CONTRACT.md` back over the
   shared WebSocket (via Member 1's context, not a new connection).
4. **Simple voice commands**: at minimum, support something like "read
   my ETA" and "log a break" as directly-spoken commands, not just
   responses to prompts — this is what separates "voice-enabled" from
   "has a microphone icon."
5. **`mock_llm_server.py`**: a `/mock/nudge` endpoint that takes a
   rule-trigger payload and returns a canned `alert` message in the
   `CONTRACT.md` shape, so you can build and demo the voice flow without
   waiting on the real Claude wiring.

## Local run

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python mock_llm_server.py
```
