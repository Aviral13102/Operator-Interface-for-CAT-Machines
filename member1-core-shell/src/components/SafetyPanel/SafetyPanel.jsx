import React from 'react';
import { useTelemetry } from '../../hooks/useTelemetry';
import { IdlingMonitor } from '../IdlingMonitor/IdlingMonitor';
import { Leaderboard } from '../Leaderboard/Leaderboard';
import { SafetyControls } from '../SafetyControls/SafetyControls';
import styles from './SafetyPanel.module.css';

export function SafetyPanel() {
  const { telemetry } = useTelemetry();

  const safeTelemetry = telemetry || {
    idling_time_min: 0,
    seatbelt_fastened: true
  };

  return (
    <div className={styles.panelContainer}>
      <IdlingMonitor idlingTimeMin={safeTelemetry.idling_time_min} />
      <div className={styles.topRow}>
        <Leaderboard operatorId="OP-22" />
        <SafetyControls seatbeltFastened={safeTelemetry.seatbelt_fastened} />
      </div>
    </div>
  );
}
