/**
 * TaskDashboard.jsx — Main single-focus current-task view
 * (Member 1 / Core Shell)
 *
 * Layout (top → bottom):
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │  Top bar: machine ID · task type · operator skill · weather     │
 *   │                                     [ConnectionStatus badge]    │
 *   ├─────────────────────────────────────────────────────────────────┤
 *   │                                                                 │
 *   │                     [ EtaDisplay ]                              │
 *   │                  (primary focus element)                        │
 *   │                                                                 │
 *   ├──────────────────────────┬──────────────────────────────────────┤
 *   │  [Member 2 Slot]         │  [Member 3 Slot]                    │
 *   │  Voice Nudge UI          │  Safety/Idling Panel                │
 *   │                          │  + Leaderboard                      │
 *   └──────────────────────────┴──────────────────────────────────────┘
 *
 * How Members 2 & 3 plug in:
 *   Find the two <Slot> components below and replace with:
 *     <Slot name="voice-nudge" ...> <YourComponent /> </Slot>
 *
 * Data:
 *   All data comes from useTelemetry() — no props needed at the top level.
 */

import React from 'react';
import { useTelemetry } from '../../hooks/useTelemetry';
import { ConnectionStatus } from '../ConnectionStatus/ConnectionStatus';
import { EtaDisplay, EtaDisplaySkeleton } from '../EtaDisplay/EtaDisplay';
import { Slot } from '../Slot/Slot';
import { SafetyPanel } from '../SafetyPanel/SafetyPanel';
import styles from './TaskDashboard.module.css';

/** Map raw weather strings to readable emoji labels */
const WEATHER_ICON = {
  Rainy:  '🌧',
  Sunny:  '☀️',
  Cloudy: '⛅',
  Windy:  '💨',
  Foggy:  '🌫',
};

export function TaskDashboard() {
  const { telemetry, connectionStatus } = useTelemetry();

  // Idle / loading state — first WebSocket message hasn't arrived yet
  if (!telemetry) {
    return (
      <div className={styles.layout}>
        {/* Top bar — skeleton mode */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <span className={styles.machineId}>—</span>
            <span className={styles.pill}>Waiting for data…</span>
          </div>
          <ConnectionStatus status={connectionStatus} />
        </header>

        {/* Centre: skeleton ETA */}
        <main className={styles.centre}>
          <EtaDisplaySkeleton />
        </main>

        {/* Bottom slots */}
        <div className={styles.slots}>
          <Slot name="voice-nudge"   label="[Member 2] Voice Nudge UI" />
          <SafetyPanel />
        </div>
      </div>
    );
  }

  const {
    machine_id,
    task_type,
    weather,
    operator_skill,
    idling_time_min,
    seatbelt_fastened,
    eta_min,
    eta_confidence_range_min,
    estimated_time_min,
  } = telemetry;

  const weatherEmoji = WEATHER_ICON[weather] ?? '🌡';

  return (
    <div className={styles.layout}>

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>

          {/* Machine ID */}
          <span className={styles.machineId}>{machine_id}</span>

          {/* Task type */}
          <span className={styles.pill}>{task_type}</span>

          {/* Operator skill */}
          <span className={`${styles.pill} ${styles.pillMuted}`}>
            {operator_skill}
          </span>

          {/* Weather */}
          <span className={`${styles.pill} ${styles.pillMuted}`}>
            {weatherEmoji} {weather}
          </span>

          {/* Seatbelt warning — visible only when unfastened */}
          {!seatbelt_fastened && (
            <span className={`${styles.pill} ${styles.pillDanger}`} role="alert">
              ⚠ Seatbelt unfastened
            </span>
          )}

          {/* Idling warning — visible when idling_time_min is meaningful */}
          {idling_time_min > 0 && (
            <span className={`${styles.pill} ${styles.pillWarning}`}>
              Idling {idling_time_min} min
            </span>
          )}
        </div>

        {/* Connection status badge — top-right */}
        <ConnectionStatus status={connectionStatus} />
      </header>

      {/* ── Centre: primary ETA focus ────────────────────────────────────── */}
      <main className={styles.centre}>
        <EtaDisplay
          etaMin={eta_min}
          etaConfidenceRange={eta_confidence_range_min}
          estimatedTimeMin={estimated_time_min}
        />
      </main>

      {/* ── Bottom: placeholder slots for Members 2 & 3 ─────────────────── */}
      {/*                                                                     */}
      {/*  Member 2 — drop your NudgePanel (or similar) here:                */}
      {/*    <Slot name="voice-nudge" label="...">                            */}
      {/*      <NudgePanel />                                                 */}
      {/*    </Slot>                                                          */}
      {/*                                                                     */}
      {/*  Member 3 — drop your SafetyPanel here:                             */}
      {/*    <Slot name="safety-panel" label="...">                           */}
      {/*      <SafetyPanel />                                                */}
      {/*    </Slot>                                                          */}
      {/*                                                                     */}
      <div className={styles.slots}>
        <Slot
          name="voice-nudge"
          label="[Member 2] Voice Nudge UI"
        />
        <SafetyPanel />
      </div>

    </div>
  );
}
