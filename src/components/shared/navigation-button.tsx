'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface NavigationButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showBackIcon?: boolean;
}

/**
 * Client-side navigation button that uses router.push for reliable navigation
 * Especially useful in error pages to avoid cascading errors
 */
export function NavigationButton({
  href,
  children,
  variant = 'default',
  size = 'lg',
  className = '',
  showBackIcon = false,
}: NavigationButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={className}
    >
      {showBackIcon && <ArrowLeft className='w-4 h-4 mr-2' />}
      {children}
    </Button>
  );
}
