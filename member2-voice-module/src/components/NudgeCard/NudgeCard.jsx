/**
 * NudgeCard.jsx — Displays and speaks alert messages, handles voice/touch response
 * (Member 2 / Voice Interaction Module)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTelemetryContext } from '../../../../member1-core-shell/src/context/TelemetryContext';
import { useVoice } from '../../hooks/useVoice';
import styles from './NudgeCard.module.css';

export function NudgeCard({ alerts }) {
  const { sendMessage } = useTelemetryContext();
  const { isSupported, isListening, transcript, startListening, stopListening, speak } = useVoice();
  
  const [activeAlert, setActiveAlert] = useState(null);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  
  // Track if we have already spoken the current alert so we don't repeat it on re-renders
  const lastSpokenAlertId = useRef(null);

  // 1. Find the latest un-dismissed alert and activate it
  useEffect(() => {
    const latest = alerts.find(a => !dismissedIds.has(a.id));
    
    if (latest && latest.id !== activeAlert?.id) {
      setActiveAlert(latest);
      
      if (lastSpokenAlertId.current !== latest.id) {
        speak(latest.message);
        lastSpokenAlertId.current = latest.id;
        
        // Auto-start listening if a response is required and voice is supported
        if (latest.requires_response) {
          startListening();
        }
      }
    } else if (!latest && activeAlert) {
      // All alerts dismissed
      setActiveAlert(null);
      stopListening();
    }
  }, [alerts, dismissedIds, activeAlert, speak, startListening, stopListening]);

  // 2. Check the voice transcript for any of the response options
  useEffect(() => {
    if (!activeAlert || !activeAlert.requires_response || !transcript) return;
    
    const options = activeAlert.response_options || [];
    for (const option of options) {
      // Very basic keyword matching for demonstration
      if (transcript.includes(option.toLowerCase())) {
        handleResponse(option);
        break;
      }
    }
  }, [transcript, activeAlert]);

  const handleResponse = (response) => {
    if (activeAlert) {
      sendMessage({
        type: 'alert_response',
        alert_id: activeAlert.id,
        response: response
      });
      setDismissedIds(prev => new Set(prev).add(activeAlert.id));
    }
    stopListening();
  };

  const handleDismissOnly = () => {
    if (activeAlert) {
      setDismissedIds(prev => new Set(prev).add(activeAlert.id));
    }
    stopListening();
  };

  if (!activeAlert) {
    return null; // Don't render anything if there's no active alert
  }

  return (
    <div className={`${styles.card} ${styles[activeAlert.severity] || styles.info}`}>
      <div className={styles.header}>
        <span className={styles.icon}>
          {activeAlert.severity === 'critical' ? '🛑' : activeAlert.severity === 'warning' ? '⚠️' : 'ℹ️'}
        </span>
        <span className={styles.title}>Copilot Nudge</span>
      </div>
      
      <p className={styles.message}>{activeAlert.message}</p>
      
      {activeAlert.requires_response ? (
        <div className={styles.responseArea}>
          <p className={styles.prompt}>
            {isSupported 
              ? (isListening ? '🎙️ Listening for your response...' : 'Tap an option below:')
              : 'Tap an option to respond:'}
          </p>
          <div className={styles.buttonGroup}>
            {activeAlert.response_options?.map(opt => (
              <button key={opt} className={styles.button} onClick={() => handleResponse(opt)}>
                {opt}
              </button>
            ))}
          </div>
          {isSupported && isListening && transcript && (
            <p className={styles.transcript}>"{transcript}"</p>
          )}
        </div>
      ) : (
        <div className={styles.responseArea}>
          <button className={styles.button} onClick={handleDismissOnly}>Acknowledge</button>
        </div>
      )}
    </div>
  );
}
