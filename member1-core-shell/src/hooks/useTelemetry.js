/**
 * useTelemetry.js — Convenience hook for Member 1's own components
 * (Member 1 / Core Shell)
 *
 * Thin wrapper around useTelemetryContext() that returns only the fields
 * needed to render telemetry data and connection status. Use this in
 * Member 1's components. Members 2 and 3 should call useTelemetryContext()
 * directly to also get alerts and sendMessage.
 *
 * Returns:
 *   {
 *     telemetry:        object | null   — latest CONTRACT.md telemetry shape
 *     connectionStatus: string          — "connected" | "reconnecting" | "disconnected"
 *   }
 */

import { useTelemetryContext } from '../context/TelemetryContext';

export function useTelemetry() {
  const { telemetry, connectionStatus } = useTelemetryContext();
  return { telemetry, connectionStatus };
}
