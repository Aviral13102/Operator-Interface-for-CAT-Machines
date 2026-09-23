# Member 2 — Voice Interaction Module

You own the "voice-first" differentiator — the thing that makes this a
conversational co-pilot instead of another dashboard. Build against
Member 1's `alert` messages (see [`../CONTRACT.md`](../CONTRACT.md)), not
against the real Claude integration — `mock_llm_server.py` stands in for
that until Hour 10.

## Tasks (Completed)
- **`useVoice` hook**: Wraps the Web Speech API (STT & TTS). Safely detects if the browser doesn't support it and fails gracefully to text/touch mode.
- **Nudge UI component**: Renders incoming `alert` messages and reads them aloud. Allows operators to respond either via voice or by tapping large touch-friendly buttons.
- **Standalone Commands**: Continuous listening for "read my ETA" (speaks back telemetry stats) or "log a break" (sends a proposed `alert_response` schema payload).
- **Dev Shim (`DevAlertInjector.jsx`)**: Added to manually fetch alerts from `mock_llm_server.py` into the UI. *(See Architectural Notes below)*

---

## 🚨 Architectural Notes & Dev Shim

Currently, Member 1's `mock_server.py` **does not** poll `mock_llm_server.py` to inject mock alerts into the shared WebSocket stream.

To allow independent development and testing of the Nudge UI, this module includes a **DevAlertInjector** shim. When running in dev mode (`import.meta.env.DEV`), a small box appears at the bottom of the slot allowing you to manually trigger "Idling" or "Seatbelt" alerts. These fetch directly from port 8002 and inject into the local state.

**Member 1 To-Do:** For the final integration, `mock_server.py` (or the real backend) must handle injecting these `alert` messages directly into the WebSocket.

---

## How to run the full stack

You need to run all the servers together to test the full flow:

```bash
# Terminal 1: Member 1's WebSocket telemetry server (Port 8001)
cd member1-core-shell
python mock_server.py

# Terminal 2: Member 2's Mock LLM / Alert server (Port 8002)
cd member2-voice-module
python mock_llm_server.py

# Terminal 3: Member 3's Mock Safety Server (Port 8003)
cd member3-safety-deploy
python mock_safety_server.py

# Terminal 4: Frontend React App (Port 5173)
# Run from the repository root
npm run dev
```

Once running, you can click "Inject Idling Alert" in the Dev Tools box in the UI to see the Voice Nudge card appear and speak.
