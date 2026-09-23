import React, { useState, useEffect } from 'react';
import styles from './SafetyControls.module.css';

export function SafetyControls({ seatbeltFastened }) {
  const [localSeatbelt, setLocalSeatbelt] = useState(seatbeltFastened);
  const [proximityAlert, setProximityAlert] = useState(false);

  // Sync with incoming telemetry (simulating hardware switch state)
  useEffect(() => {
    setLocalSeatbelt(seatbeltFastened);
  }, [seatbeltFastened]);

  const handleSeatbeltToggle = (e) => {
    const newState = e.target.checked;
    setLocalSeatbelt(newState);
    
    // In a real integration, this would send an event to the backend/websocket
    console.log("Rule trigger: seatbelt state changed to", newState);
  };

  const handleProximityToggle = (e) => {
    const newState = e.target.checked;
    setProximityAlert(newState);
    
    // Member 2 would intercept this trigger via websocket or context to fire a nudge
    console.log("Rule trigger: proximity alert changed to", newState);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Hardware Triggers</h3>
      
      <div className={styles.controlRow}>
        <div className={styles.controlLabel}>
          <span className={styles.labelText}>Seatbelt Fastened</span>
          <span className={styles.labelSub}>Simulates cabin sensor</span>
        </div>
        <label className={styles.switch}>
          <input 
            type="checkbox" 
            checked={localSeatbelt} 
            onChange={handleSeatbeltToggle} 
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      <div className={styles.controlRow}>
        <div className={styles.controlLabel}>
          <span className={styles.labelText}>Proximity Alert</span>
          <span className={styles.labelSub}>Triggers voice nudge</span>
        </div>
        <label className={styles.switch}>
          <input 
            type="checkbox" 
            checked={proximityAlert} 
            onChange={handleProximityToggle} 
          />
          <span className={styles.slider}></span>
        </label>
      </div>
    </div>
  );
}
