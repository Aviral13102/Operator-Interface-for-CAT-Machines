/**
 * EtaDisplay.jsx — ETA + confidence interval, the primary focus element
 * (Member 1 / Core Shell)
 *
 * Renders:
 *   ┌─────────────────────────────────────────┐
 *   │  ETA                                    │
 *   │  47 min                                 │  ← large, bold
 *   │  est. 43 – 52 min                       │  ← confidence range, smaller
 *   │  (estimated 42 min)                     │  ← model's base estimate
 *   └─────────────────────────────────────────┘
 *
 * Props (all from the CONTRACT.md telemetry shape):
 *   etaMin                 number   e.g. 47
 *   etaConfidenceRange     [number, number]   e.g. [43, 52]
 *   estimatedTimeMin       number   e.g. 42
 */

import React from 'react';
import styles from './EtaDisplay.module.css';

export function EtaDisplay({ etaMin, etaConfidenceRange, estimatedTimeMin }) {
  const [low, high] = etaConfidenceRange ?? [etaMin, etaMin];

  return (
    <div className={styles.container}>
      <p className={styles.heading}>Estimated Time to Completion</p>

      {/* Primary ETA — the single largest number on screen */}
      <p className={styles.eta}>
        {etaMin}
        <span className={styles.unit}> min</span>
      </p>

      {/* Confidence range */}
      <p className={styles.range}>
        confidence range: {low} – {high} min
      </p>

      {/* Model's base estimate for comparison */}
      <p className={styles.estimate}>
        model estimate: {estimatedTimeMin} min
      </p>
    </div>
  );
}

/**
 * EtaDisplaySkeleton — shown while waiting for the first telemetry message.
 */
export function EtaDisplaySkeleton() {
  return (
    <div className={`${styles.container} ${styles.skeleton}`}>
      <p className={styles.heading}>Estimated Time to Completion</p>
      <p className={styles.eta}>
        <span className={styles.skeletonBar} style={{ width: '5rem', height: '3.5rem' }} />
      </p>
      <p className={styles.range}>
        <span className={styles.skeletonBar} style={{ width: '10rem', height: '1rem' }} />
      </p>
    </div>
  );
}
