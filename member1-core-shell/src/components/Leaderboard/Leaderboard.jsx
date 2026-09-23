import React, { useEffect, useState } from 'react';
import styles from './Leaderboard.module.css';

const FireIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

export function Leaderboard({ operatorId }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from mock server setup by Member 3
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        // Sort by streak days descending
        const sorted = data.sort((a, b) => b.streak_days - a.streak_days);
        setLeaders(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch leaderboard", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Safety Leaderboard</h3>
      
      <div className={styles.list}>
        {loading ? (
          <div style={{ color: 'var(--color-text-muted)' }}>Loading standings...</div>
        ) : (
          leaders.map((leader, index) => {
            const isActive = leader.operator_id === operatorId;
            return (
              <div 
                key={leader.operator_id} 
                className={`${styles.row} ${isActive ? styles.rowActive : ''}`}
              >
                <div className={styles.operatorInfo}>
                  <span className={styles.rank}>#{index + 1}</span>
                  <div className={styles.avatar}>
                    {leader.name.charAt(0)}
                  </div>
                  <span className={styles.name}>
                    {leader.name} {isActive && '(You)'}
                  </span>
                </div>
                <div className={styles.streak}>
                  <span className={styles.streakNumber}>{leader.streak_days}</span>
                  <span className={styles.streakLabel}>days</span>
                  <span className={styles.fireIcon}><FireIcon /></span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
