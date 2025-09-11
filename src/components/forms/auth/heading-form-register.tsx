'use client';

import authStore from '@/lib/stores/authStore';
import React from 'react';

export default function RegisterHeading() {
  const type = authStore((state) => state.type);

  return (
    <>
      {type === '' && <h4>Δημιουργία λογαριασμού!</h4>}
      {type === 'user' && <h4>Δημιουργία λογαριασμού νέου χρήστη!</h4>}
      {type === 'pro' && (
        <h4>
          Δημιούργησε έναν επαγγελματικό λογαριασμό για να προσφέρεις τις
          υπηρεσίες σου!
        </h4>
      )}
    </>
  );
}
