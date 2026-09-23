import React from 'react';
import styles from './IdlingMonitor.module.css';

// SVG Icons to match the requested design
const SpeedometerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20v-2" />
    <path d="M12 10l-3 3" />
    <path d="M4 16c-1.5-2-2.5-4.5-2.5-7.5C1.5 4 6 1 12 1s10.5 3 10.5 7.5c0 3-1 5.5-2.5 7.5" />
  </svg>
);

const DollarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 18V6" />
  </svg>
);

export function IdlingMonitor({ idlingTimeMin }) {
  // Use a fallback of $4.60 per min if env var is missing
  const idlingRate = import.meta.env.VITE_IDLING_RATE_USD || 4.60;
  const cost = (idlingTimeMin * idlingRate).toFixed(2);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <span className={styles.badgeText}>LIVE MACHINE STATE</span>
          <h2 className={styles.title}>Idling monitor</h2>
        </div>
        <div className={styles.iconWrapper}>
          <SpeedometerIcon />
        </div>
      </div>

      <div>
        <div className={styles.timeDisplay}>
          <span className={styles.bigNumber}>{idlingTimeMin}</span>
          <span className={styles.unit}>MIN</span>
        </div>
        <div className={styles.subtitle}>Current continuous idle time</div>
      </div>

      <div className={styles.costBox}>
        <div className={styles.costLeft}>
          <div className={styles.dollarIcon}>
            <DollarIcon />
          </div>
          <div className={styles.costDetails}>
            <span className={styles.costValue}>${cost}</span>
            <span className={styles.costLabel}>IDLING COST</span>
          </div>
        </div>
        <div className={styles.costRate}>${idlingRate.toFixed(2)} / min</div>
      </div>
    </div>
  );
}
