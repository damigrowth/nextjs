'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ApiKeyPrompt } from '../admin';

interface ClientAdminGuardProps {
  children: React.ReactNode;
}

interface AdminSession {
  validated: boolean;
  expiresAt: number;
  source: 'environment' | 'database';
  keyData: any;
}

export function ClientAdminGuard({ children }: ClientAdminGuardProps) {
  const [hasApiAccess, setHasApiAccess] = useState<boolean | null>(null);
  const [showApiPrompt, setShowApiPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAdminSession = () => {
    try {
      const stored = sessionStorage.getItem('admin_api_access');
      if (!stored) return null;

      const session: AdminSession = JSON.parse(stored);

      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        sessionStorage.removeItem('admin_api_access');
        return null;
      }

      return session;
    } catch {
      sessionStorage.removeItem('admin_api_access');
      return null;
    }
  };

  const checkApiAccess = () => {
    try {
      // Check if they have valid API access
      const adminSession = checkAdminSession();

      if (adminSession) {
        setHasApiAccess(true);
      } else {
        setHasApiAccess(false);
        setShowApiPrompt(true);
      }
    } catch (error) {
      console.error('Admin API access check failed:', error);
      setHasApiAccess(false);
      setShowApiPrompt(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkApiAccess();

    // Set up session expiry check
    const interval = setInterval(() => {
      const adminSession = checkAdminSession();
      if (!adminSession && hasApiAccess) {
        setHasApiAccess(false);
        setShowApiPrompt(true);
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [hasApiAccess]);

  const handleApiKeySuccess = (keyData: any) => {
    setHasApiAccess(true);
    setShowApiPrompt(false);
  };

  const handleApiKeyCancel = () => {
    setShowApiPrompt(false);
    router.push('/dashboard');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingSpinner />
      </div>
    );
  }

  // Authenticated admin but no API access
  if (!hasApiAccess) {
    return (
      <>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold mb-4'>Admin Access Required</h2>
            <p className='text-muted-foreground mb-4'>
              Please provide your admin API key to continue
            </p>
            <LoadingSpinner className='mx-auto' />
          </div>
        </div>
        <ApiKeyPrompt
          isOpen={showApiPrompt}
          onSuccess={handleApiKeySuccess}
          onCancel={handleApiKeyCancel}
        />
      </>
    );
  }

  // Fully authorized
  return <>{children}</>;
}
