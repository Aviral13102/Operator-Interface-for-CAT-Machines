/**
 * Slot.jsx — Composable layout placeholder for Members 2 & 3
 * (Member 1 / Core Shell)
 *
 * Usage (Member 1's layout):
 *   <Slot name="voice-nudge" label="[Member 2] Voice Nudge UI" />
 *
 * Once Member 2 or 3 is ready to plug in their component:
 *   <Slot name="voice-nudge" label="[Member 2] Voice Nudge UI">
 *     <NudgePanel />          ← their component goes here as children
 *   </Slot>
 *
 * When children are present the dashed placeholder box is replaced by the
 * children themselves — no other changes needed in this file.
 */

import React from 'react';
import styles from './Slot.module.css';

/**
 * @param {string}      name    Identifier for the slot (used as aria-label)
 * @param {string}      label   Human-readable label shown in the placeholder box
 * @param {React.Node}  children  If provided, renders instead of the placeholder
 */
export function Slot({ name, label, children }) {
  if (children) {
    // Real component has been dropped in — render it transparently
    return (
      <section className={styles.filled} aria-label={name}>
        {children}
      </section>
    );
  }

  // Placeholder mode — visible to developers, never to end users
  return (
    <section className={styles.placeholder} aria-label={name}>
      <span className={styles.label}>{label}</span>
      <span className={styles.hint}>Drop your component here as children.</span>
    </section>
  );
}
