/**
 * VoiceModule.jsx — Entry point for Member 2's components
 * (Member 2 / Voice Interaction Module)
 */

import React, { useState } from 'react';
import { useTelemetryContext } from '../../../../member1-core-shell/src/context/TelemetryContext';
import { NudgeCard } from '../NudgeCard/NudgeCard';
import { VoiceCommandListener } from '../VoiceCommandListener/VoiceCommandListener';
import { DevAlertInjector } from '../DevAlertInjector/DevAlertInjector';

export function VoiceModule() {
  const { alerts: realAlerts } = useTelemetryContext();
  
  // Dev shim state for manually injected alerts
  const [devAlerts, setDevAlerts] = useState([]);
  
  // Merge them (dev alerts take precedence for easy testing)
  const mergedAlerts = [...devAlerts, ...realAlerts];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <VoiceCommandListener />
      <NudgeCard alerts={mergedAlerts} />
      {import.meta.env.DEV && (
        <DevAlertInjector onInject={(alert) => setDevAlerts(prev => [alert, ...prev])} />
      )}
    </div>
  );
}
