import Link from 'next/link';
import { ComponentProps } from 'react';

interface LinkNPProps extends Omit<ComponentProps<typeof Link>, 'prefetch'> {
  href: string;
  children: React.ReactNode;
  prefetch?: boolean;
  className?: string;
}

/**
 * Optimized Link component that disables prefetching by default
 * This prevents unnecessary function invocations on Vercel
 */
export default function LinkNP({
  href,
  children,
  prefetch = false, // Default to false to prevent Vercel function invocations
  className,
  ...props
}: LinkNPProps) {
  return (
    <Link href={href} prefetch={prefetch} className={className} {...props}>
      {children}
    </Link>
  );
}