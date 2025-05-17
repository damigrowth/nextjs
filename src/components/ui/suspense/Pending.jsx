"use client";

import { useEffect, useState } from "react";

export default function Pending({ children, fallback }) {
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const checkPending = () => {
      setIsPending(document.querySelector("[data-pending]") !== null);
    };

    // Initial check
    checkPending();

    // Set up observer
    const observer = new MutationObserver(checkPending);
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-pending"],
    });

    return () => observer.disconnect();
  }, []);

  return isPending ? fallback : children;
}
