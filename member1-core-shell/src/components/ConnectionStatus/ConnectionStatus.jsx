/**
 * ConnectionStatus.jsx — Subtle connection status badge
 * (Member 1 / Core Shell)
 *
 * Shows a small coloured dot + label in the top-right corner of the layout.
 * Intentionally unobtrusive — it should NOT dominate the screen when connected.
 * It becomes noticeable (amber, animated pulse) only while reconnecting.
 *
 * Props:
 *   status  "connected" | "reconnecting" | "disconnected"
 */

import React from 'react';
import styles from './ConnectionStatus.module.css';

const CONFIG = {
  connected: {
    label: 'Live',
    dotClass: styles.dotGreen,
    textClass: styles.textMuted,
  },
  reconnecting: {
    label: 'Reconnecting…',
    dotClass: `${styles.dotAmber} ${styles.pulse}`,
    textClass: styles.textAmber,
  },
  disconnected: {
    label: 'Disconnected',
    dotClass: styles.dotRed,
    textClass: styles.textRed,
  },
};

export function ConnectionStatus({ status }) {
  const cfg = CONFIG[status] ?? CONFIG.disconnected;

  return (
    <div className={styles.badge} role="status" aria-live="polite">
      <span className={`${styles.dot} ${cfg.dotClass}`} aria-hidden="true" />
      <span className={`${styles.label} ${cfg.textClass}`}>{cfg.label}</span>
    </div>
  );
}
