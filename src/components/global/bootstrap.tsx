'use client';

import { useEffect } from 'react';

export default function InstallBootstrap() {
  useEffect(() => {
    // Load only the Bootstrap components we actually use
    const loadBootstrapModules = async () => {
      try {
        await Promise.all([
          import('bootstrap/js/dist/modal'),
          import('bootstrap/js/dist/dropdown'),
          import('bootstrap/js/dist/tooltip'),
          import('bootstrap/js/dist/collapse')
          // offcanvas loaded dynamically in mobile-menu-container for performance
        ]);
      } catch (error) {
        console.warn('Failed to load Bootstrap modules:', error);
        // Fallback to full bootstrap bundle if modular loading fails
        import('bootstrap/dist/js/bootstrap.bundle');
      }
    };

    loadBootstrapModules();
  }, []);

  return <></>;
}
