'use client';

import dynamic from 'next/dynamic';

const CookiesBanner = dynamic(
  () => import('../shared/banner-cookies'),
  {
    ssr: false,
    loading: () => null, // No loading state needed for cookies banner
  },
);

interface CookiesBanner_DProps {
  children: React.ReactNode;
}

export default function CookiesBanner_D({ children }: CookiesBanner_DProps) {
  return <CookiesBanner>{children}</CookiesBanner>;
}
