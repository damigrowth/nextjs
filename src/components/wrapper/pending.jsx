'use client';

import { Suspense, useEffect, useState } from 'react';

export default function Pending({ children, fallback, keys }) {
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const checkPending = () => {
      setIsPending(document.querySelector('[data-pending]') !== null);
    };

    // Initial check
    checkPending();

    // Set up observer
    const observer = new MutationObserver(checkPending);

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-pending'],
    });

    return () => observer.disconnect();
  }, []);

  return isPending ? (
    fallback
  ) : (
    <Suspense fallback={fallback} key={JSON.stringify(keys)}>
      {children}
    </Suspense>
  );
}
