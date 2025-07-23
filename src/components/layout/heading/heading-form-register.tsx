'use client';

import authStore from '@/lib/stores/authStore';
import React from 'react';

export default function RegisterHeading() {
  const type = authStore((state) => state.type);

  return (
    <>
      {type === 0 && <h4>Δημιουργία λογαριασμού!</h4>}
      {type === 1 && <h4>Δημιουργία λογαριασμού νέου χρήστη!</h4>}
      {type === 2 && (
        <h4>
          Δημιούργησε έναν επαγγελματικό λογαριασμό για να προσφέρεις τις
          υπηρεσίες σου!
        </h4>
      )}
    </>
  );
}
