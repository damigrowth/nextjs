import Link from 'next/link';

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
}) {
  return (
    <Link href={href} prefetch={prefetch} className={className} {...props}>
      {children}
    </Link>
  );
}
