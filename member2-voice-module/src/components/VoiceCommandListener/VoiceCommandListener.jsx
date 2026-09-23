/**
 * VoiceCommandListener.jsx — Background/UI listener for standalone commands
 * (Member 2 / Voice Interaction Module)
 */

import React, { useEffect, useRef } from 'react';
import { useTelemetryContext } from '../../../../member1-core-shell/src/context/TelemetryContext';
import { useVoice } from '../../hooks/useVoice';
import styles from './VoiceCommandListener.module.css';

export function VoiceCommandListener() {
  const { telemetry, sendMessage } = useTelemetryContext();
  const { isSupported, isListening, transcript, startListening, stopListening, speak } = useVoice();
  
  // Ref to track if we just processed a command to avoid repeats in the same transcript burst
  const lastProcessedTranscript = useRef('');

  useEffect(() => {
    if (!transcript || transcript === lastProcessedTranscript.current) return;

    const lowerTranscript = transcript.toLowerCase();

    // Command: Read ETA
    if (lowerTranscript.includes('read my eta') || lowerTranscript.includes('what is my eta')) {
      lastProcessedTranscript.current = transcript;
      if (telemetry) {
        const { eta_min, eta_confidence_range_min } = telemetry;
        const [low, high] = eta_confidence_range_min || [eta_min, eta_min];
        speak(`Your estimated time is ${eta_min} minutes. The confidence range is ${low} to ${high} minutes.`);
      } else {
        speak('ETA is currently unavailable.');
      }
      // Restart listening after speaking so the operator doesn't have to tap again
      // (Normally speak cancels listening in some browsers, but we keep it simple here)
      stopListening();
    }

    // Command: Log a break
    if (lowerTranscript.includes('log a break') || lowerTranscript.includes('take a break')) {
      lastProcessedTranscript.current = transcript;
      
      // Sending proposed format for standalone command (alert_id: null, trigger: voice_command)
      sendMessage({
        type: 'alert_response',
        alert_id: null,
        trigger: 'voice_command',
        response: 'Taking a break'
      });
      
      speak('Break logged. Take your time.');
      stopListening();
    }
    
  }, [transcript, telemetry, speak, sendMessage, stopListening]);

  if (!isSupported) {
    return null; // Don't show the voice command button if Web Speech API isn't supported
  }

  return (
    <div className={styles.container}>
      <button 
        className={`${styles.micButton} ${isListening ? styles.active : ''}`}
        onClick={isListening ? stopListening : startListening}
      >
        <span className={styles.icon}>{isListening ? '🔴' : '🎤'}</span>
        <span className={styles.label}>
          {isListening ? 'Listening for commands...' : 'Tap for Voice Commands'}
        </span>
      </button>
      
      {isListening && transcript && (
        <div className={styles.transcriptPopover}>
          "{transcript}"
        </div>
      )}
    </div>
  );
}
