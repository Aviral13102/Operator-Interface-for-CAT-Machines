/**
 * App.jsx — Root component
 * (Member 1 / Core Shell)
 *
 * Mounts <TelemetryProvider> once so every component in the tree —
 * including Member 2's and Member 3's — can call useTelemetryContext().
 */

import React from 'react';
import { TelemetryProvider } from './context/TelemetryContext';
import { TaskDashboard } from './components/TaskDashboard/TaskDashboard';

export default function App() {
  return (
    <TelemetryProvider>
      {/*
        Member 2 and Member 3: you don't need to touch this file.
        Your components are slotted inside TaskDashboard via <Slot>.
        See src/components/TaskDashboard/TaskDashboard.jsx for the slot names.
      */}
      <TaskDashboard />
    </TelemetryProvider>
  );
}
