'use client';

import dynamic from 'next/dynamic';

const CookiesBanner = dynamic(
  () =>
    import('../banner').then((mod) => ({
      default: mod.CookiesBanner,
    })),
  {
    ssr: false,
    loading: () => null, // No loading state needed for cookies banner
  },
);

export default function CookiesBanner_D() {
  return <CookiesBanner />;
}
