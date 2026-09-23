/**
 * wsManager.js — Core WebSocket client (Member 1 / Core Shell)
 *
 * Pure JS — no React dependency.  Import this from TelemetryContext (or
 * directly from any component) to get a single, shared WebSocket connection
 * that any part of the app can subscribe to.
 *
 * ── Public API ─────────────────────────────────────────────────────────────
 *
 *   const ws = createWsManager(url);
 *
 *   ws.connect()                     // open the socket + start reconnect loop
 *   ws.disconnect()                  // close permanently (no reconnect)
 *   ws.subscribe(type, callback)     // listen for a specific message type
 *                                    // returns an unsubscribe() function
 *   ws.sendMessage(payload)          // send a JSON payload (queued if not open)
 *   ws.getStatus()                   // "connected" | "reconnecting" | "disconnected"
 *   ws.onStatusChange(callback)      // called whenever status changes
 *
 * ── Message types (from CONTRACT.md) ────────────────────────────────────────
 *
 *   "telemetry"              — periodic machine data from mock_server.py / real backend
 *   "alert"                  — Claude-generated nudge from Member 2's server
 *   "alert_response"         — operator answer, sent *back* to the server
 *   "training_recommendation"— training video suggestion
 *
 * ── Reconnect backoff ────────────────────────────────────────────────────────
 *
 *   Starts at INITIAL_DELAY_MS, doubles on each failure, caps at MAX_DELAY_MS.
 *   Retries indefinitely — never gives up.
 *   Tweak the three constants below to adjust timing.
 */

// ─── Backoff constants — easy to adjust ────────────────────────────────────
const INITIAL_DELAY_MS   = 1000;   // first retry after 1 second
const BACKOFF_MULTIPLIER = 2;      // double each attempt
const MAX_DELAY_MS       = 30_000; // cap at 30 seconds

// ─── Connection status strings — use these exact values ─────────────────────
// Member 2 and Member 3 pattern-match on these — do NOT change them.
export const STATUS = {
  CONNECTED:    'connected',
  RECONNECTING: 'reconnecting',
  DISCONNECTED: 'disconnected',
};

/**
 * createWsManager(url)
 *
 * Factory function that returns a WebSocket manager instance.
 *
 * @param {string} url  Full WebSocket URL, e.g. "ws://localhost:8001/ws"
 * @returns {object}    Manager instance — see public API above
 */
export function createWsManager(url) {
  // ── Internal state ─────────────────────────────────────────────────────────
  let socket          = null;
  let currentStatus   = STATUS.DISCONNECTED;
  let retryDelay      = INITIAL_DELAY_MS;
  let retryTimer      = null;
  let intentionallyClosed = false;   // set true only when .disconnect() is called

  // Map of message-type → Set of listener callbacks
  const listeners = new Map();

  // List of status-change callbacks
  const statusListeners = new Set();

  // Queue of messages to send once the socket is open
  const sendQueue = [];

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Update internal status and notify all status listeners. */
  function setStatus(next) {
    if (next === currentStatus) return;
    currentStatus = next;
    statusListeners.forEach((cb) => cb(next));
  }

  /** Dispatch a parsed message to all subscribers for that type. */
  function dispatch(parsed) {
    const type = parsed?.type;
    if (!type) return;
    const set = listeners.get(type);
    if (set) {
      set.forEach((cb) => cb(parsed));
    }
  }

  /** Flush any messages that were queued before the socket was open. */
  function flushQueue() {
    while (sendQueue.length > 0 && socket?.readyState === WebSocket.OPEN) {
      socket.send(sendQueue.shift());
    }
  }

  // ── Core connect logic ─────────────────────────────────────────────────────

  function connect() {
    if (intentionallyClosed) return;

    // Prevent double-connect
    if (socket && socket.readyState !== WebSocket.CLOSED) return;

    socket = new WebSocket(url);

    socket.onopen = () => {
      retryDelay = INITIAL_DELAY_MS; // reset backoff on successful connection
      setStatus(STATUS.CONNECTED);
      flushQueue();
    };

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        dispatch(parsed);
      } catch (err) {
        console.warn('[wsManager] Could not parse message:', event.data, err);
      }
    };

    socket.onclose = () => {
      if (intentionallyClosed) {
        setStatus(STATUS.DISCONNECTED);
        return;
      }

      // Connection dropped — schedule a retry
      setStatus(STATUS.RECONNECTING);

      const delay = retryDelay;
      retryDelay = Math.min(retryDelay * BACKOFF_MULTIPLIER, MAX_DELAY_MS);

      console.log(`[wsManager] Disconnected. Retrying in ${delay / 1000}s…`);
      retryTimer = setTimeout(connect, delay);
    };

    socket.onerror = (err) => {
      // onerror is always followed by onclose, so reconnect is handled there
      console.warn('[wsManager] WebSocket error:', err);
    };
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * subscribe(type, callback)
   *
   * Register a callback for messages of a specific type.
   * Returns an unsubscribe function — call it inside useEffect cleanup.
   *
   * Example:
   *   const unsub = ws.subscribe('alert', (msg) => console.log(msg));
   *   // later:
   *   unsub();
   *
   * @param {string}   type      One of the CONTRACT.md message types
   * @param {function} callback  Called with the parsed message object
   * @returns {function}         Unsubscribe function
   */
  function subscribe(type, callback) {
    if (!listeners.has(type)) {
      listeners.set(type, new Set());
    }
    listeners.get(type).add(callback);

    return function unsubscribe() {
      listeners.get(type)?.delete(callback);
    };
  }

  /**
   * sendMessage(payload)
   *
   * Send a JSON payload over the WebSocket.
   *
   * The payload should match one of the CONTRACT.md outbound shapes.
   * For alert responses the shape must be exactly:
   *
   *   {
   *     type:     "alert_response",
   *     alert_id: "<string>",
   *     response: "<string>"
   *   }
   *
   * If the socket is not yet open the message is queued and sent on connect.
   *
   * @param {object} payload  Plain JS object — will be JSON.stringified
   */
  function sendMessage(payload) {
    const text = JSON.stringify(payload);
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(text);
    } else {
      // Queue it — will be flushed in socket.onopen
      sendQueue.push(text);
    }
  }

  /**
   * onStatusChange(callback)
   *
   * Register a callback that fires whenever the connection status changes.
   * Returns an unsubscribe function.
   *
   * Status values (use the STATUS export to avoid typos):
   *   "connected" | "reconnecting" | "disconnected"
   *
   * @param {function} callback  Called with the new status string
   * @returns {function}         Unsubscribe function
   */
  function onStatusChange(callback) {
    statusListeners.add(callback);
    return () => statusListeners.delete(callback);
  }

  /**
   * getStatus()
   * @returns {"connected"|"reconnecting"|"disconnected"}
   */
  function getStatus() {
    return currentStatus;
  }

  /**
   * disconnect()
   *
   * Permanently close the connection. No reconnect will be attempted.
   * Call this in the root component's cleanup (React StrictMode calls it
   * twice — intentionallyClosed guards against spurious reconnects).
   */
  function disconnect() {
    intentionallyClosed = true;
    clearTimeout(retryTimer);
    if (socket) {
      socket.close();
      socket = null;
    }
    setStatus(STATUS.DISCONNECTED);
  }

  return { connect, disconnect, subscribe, sendMessage, onStatusChange, getStatus };
}
