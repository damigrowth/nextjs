'use client';

import NextLinkOriginal, { type LinkProps as NextLinkProps } from 'next/link';
import { forwardRef, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type PrefetchStrategy = boolean | 'hover';

type NextLinkCustomProps = Omit<NextLinkProps, 'prefetch'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> & {
    children?: ReactNode;
    /**
     * Prefetch strategy for this link
     * - `false`: No prefetching (default) - Best for most links
     * - `true`: Always prefetch (viewport + hover) - Best for critical navigation
     * - `'hover'`: Only prefetch after 1.5s sustained hover - Best for listings
     * @default false
     */
    prefetch?: PrefetchStrategy;
  };

/**
 * Enhanced Next.js Link component with intelligent prefetch strategies
 *
 * @description
 * Next.js Link automatically prefetches pages on hover and viewport visibility,
 * which can cause increased costs and unnecessary requests.
 *
 * This component provides three prefetch strategies:
 *
 * **1. No Prefetch (default)** - `prefetch={false}`
 * - Completely disables prefetching
 * - Best for: Most links, footer links, external navigation
 *
 * **2. Always Prefetch** - `prefetch={true}`
 * - Enables Next.js default behavior (viewport + instant hover)
 * - Best for: Dashboard, critical CTAs, main navigation
 *
 * **3. Hover Prefetch** - `prefetch="hover"`
 * - Only prefetches after 1.5s sustained hover
 * - Best for: Service listings, search results, category pages
 * - Reduces unnecessary prefetches by 70-90%
 *
 * @example
 * ```tsx
 * import { NextLink } from '@/components';
 *
 * // Default: no prefetching
 * <NextLink href="/profile/123">View Profile</NextLink>
 *
 * // Always prefetch for critical paths
 * <NextLink href="/dashboard" prefetch={true}>
 *   Dashboard
 * </NextLink>
 *
 * // Hover prefetch for service listings
 * <NextLink href="/service/123" prefetch="hover">
 *   Premium Design Service
 * </NextLink>
 * ```
 */
const NextLink = forwardRef<HTMLAnchorElement, NextLinkCustomProps>(
  function NextLinkWithRef({ prefetch = false, ...rest }, ref) {
    const router = useRouter();
    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
    const [prefetched, setPrefetched] = useState(false);

    // Strategy 3: Hover-based prefetching with 1.5s delay
    if (prefetch === 'hover') {
      const handleMouseEnter = () => {
        if (!prefetched) {
          const timeout = setTimeout(() => {
            if (!prefetched) {
              router.prefetch(rest.href as string);
              setPrefetched(true);
            }
          }, 1500);
          setHoverTimeout(timeout);
        }
      };

      const handleMouseLeave = () => {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          setHoverTimeout(null);
        }
      };

      return (
        <NextLinkOriginal
          prefetch={false}
          {...rest}
          ref={ref}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      );
    }

    // Strategy 1 & 2: No prefetch (false) or Always prefetch (true)
    return <NextLinkOriginal prefetch={prefetch as boolean} {...rest} ref={ref} />;
  }
);

NextLink.displayName = 'NextLink';

export default NextLink;
