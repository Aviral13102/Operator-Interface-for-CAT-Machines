/**
 * TelemetryContext.jsx — React Context wrapping the WebSocket manager
 * (Member 1 / Core Shell)
 *
 * This is the single integration point for all real-time data in the app.
 * Wrap your component tree with <TelemetryProvider> (done once in App.jsx).
 * Then, from any component — including Member 2's and Member 3's — call:
 *
 *   import { useTelemetryContext } from '../context/TelemetryContext';
 *   const { telemetry, alerts, connectionStatus, sendMessage } = useTelemetryContext();
 *
 * ── What each value contains ─────────────────────────────────────────────────
 *
 *   telemetry         Latest parsed telemetry object (null until first message)
 *                     Shape: CONTRACT.md §1 — machine_id, task_type, weather,
 *                            operator_skill, machine_age_years, idling_time_min,
 *                            load_cycles, seatbelt_fastened, estimated_time_min,
 *                            eta_min, eta_confidence_range_min, timestamp
 *
 *   alerts            Array of the last MAX_ALERTS alert messages received
 *                     Shape: CONTRACT.md §2 — type, id, severity, message,
 *                            requires_response, response_options
 *
 *   connectionStatus  "connected" | "reconnecting" | "disconnected"
 *                     Use the STATUS export from wsManager to avoid magic strings.
 *
 *   sendMessage(payload)
 *                     Send a payload over the shared WebSocket.
 *                     For alert responses, the payload MUST be:
 *                       { type: "alert_response", alert_id: "...", response: "..." }
 *                     (Exactly the shape from CONTRACT.md §2 — no wrapper.)
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createWsManager, STATUS } from '../lib/wsManager';

// ── Config ───────────────────────────────────────────────────────────────────

// How many alert messages to keep in the alerts array.
const MAX_ALERTS = 10;

// WebSocket URL resolution:
//   1. If VITE_BACKEND_WS_URL is set in .env, use that (production / EC2).
//   2. Otherwise use the Vite dev-server proxy path — the proxy in vite.config.js
//      will forward /ws → ws://localhost:8001/ws transparently.
const WS_URL =
  import.meta.env.VITE_BACKEND_WS_URL ||
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;

// ── Context setup ─────────────────────────────────────────────────────────────

const TelemetryContext = createContext(null);

/**
 * <TelemetryProvider>
 *
 * Mount once at the root of the app (see App.jsx).
 * Creates and owns the single WebSocket connection for its lifetime.
 */
export function TelemetryProvider({ children }) {
  // Use a ref for the manager so it survives re-renders without re-creating.
  const managerRef = useRef(null);
  if (!managerRef.current) {
    managerRef.current = createWsManager(WS_URL);
  }
  const manager = managerRef.current;

  const [connectionStatus, setConnectionStatus] = useState(STATUS.DISCONNECTED);
  const [telemetry, setTelemetry]               = useState(null);
  const [alerts, setAlerts]                     = useState([]);

  useEffect(() => {
    // Subscribe to connection status changes.
    const unsubStatus = manager.onStatusChange(setConnectionStatus);

    // Subscribe to telemetry messages (CONTRACT.md §1).
    const unsubTelemetry = manager.subscribe('telemetry', (msg) => {
      setTelemetry(msg);
    });

    // Subscribe to alert messages (CONTRACT.md §2).
    const unsubAlerts = manager.subscribe('alert', (msg) => {
      setAlerts((prev) => [msg, ...prev].slice(0, MAX_ALERTS));
    });

    // Open the connection.
    manager.connect();

    // Cleanup on unmount (important in React StrictMode which mounts twice).
    return () => {
      unsubStatus();
      unsubTelemetry();
      unsubAlerts();
      manager.disconnect();
    };
  }, []); // empty deps — runs once on mount

  // Stable sendMessage reference so consumers don't re-render on every tick.
  const sendMessage = useCallback(
    (payload) => manager.sendMessage(payload),
    [manager]
  );

  const value = {
    telemetry,
    alerts,
    connectionStatus,
    sendMessage,
    // Expose subscribe so Members 2/3 can add their own message-type listeners
    // (e.g. for "training_recommendation") without touching this file.
    subscribe: manager.subscribe.bind(manager),
  };

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
}

/**
 * useTelemetryContext()
 *
 * The hook Members 2, 3 (and Member 1's own components) should call.
 *
 * Usage:
 *   const { telemetry, alerts, connectionStatus, sendMessage } = useTelemetryContext();
 *
 * Throws a helpful error if called outside <TelemetryProvider> so mistakes are
 * caught immediately during development.
 */
export function useTelemetryContext() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    throw new Error(
      'useTelemetryContext() must be used inside <TelemetryProvider>. ' +
        'Make sure App.jsx wraps the component tree with <TelemetryProvider>.'
    );
  }
  return ctx;
}
