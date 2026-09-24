/**
 * DevAlertInjector.jsx — Local dev shim
 * (Member 2 / Voice Interaction Module)
 *
 * Simulates an incoming alert from the mock pipeline, because currently
 * mock_server.py does not inject mock_llm_server.py alerts into the WS stream.
 */

import React from 'react';
import styles from './DevAlertInjector.module.css';

export function DevAlertInjector({ onInject }) {
  const triggerFakeAlert = async (rule) => {
    try {
      // Call our own mock_llm_server.py
      const res = await fetch('http://localhost:8002/mock/nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule, minutes: 15 })
      });
      const alert = await res.json();
      onInject(alert);
    } catch (err) {
      console.error('Failed to fetch from mock_llm_server.py:', err);
      // Fallback if server is not running
      onInject({
        type: "alert",
        id: `alert-dev-${Date.now()}`,
        severity: "warning",
        message: "Dev Fallback: You've been idling for 15 minutes — want to log a delay or shut down?",
        requires_response: true,
        response_options: ["Machine fault", "Waiting on dump truck", "Taking a break"]
      });
    }
  };

  return (
    <div className={styles.container}>
      <p className={styles.label}>Dev Tools (Local Only)</p>
      <div className={styles.buttonRow}>
        <button onClick={() => triggerFakeAlert('extended_idling')}>Inject Idling Alert</button>
        <button onClick={() => triggerFakeAlert('unfastened_seatbelt')}>Inject Seatbelt Alert</button>
      </div>
    </div>
  );
}
