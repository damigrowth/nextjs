'use client';

import { ReactCookieFirst } from '@cookiefirst/cookiefirst-react';

interface BannerCookiesProps {
  children: React.ReactNode;
}

export default function BannerCookies({ children }: BannerCookiesProps) {
  const url = process.env.NEXT_PUBLIC_COOKIEFIRST_URL;

  if (!url) {
    console.warn(
      'CookieFirst URL not configured. Please add NEXT_PUBLIC_COOKIEFIRST_URL to your .env.local file.\n' +
        'Get your URL from: https://app.cookiefirst.com/ → Domains → Settings → Your embed script'
    );
    return <>{children}</>;
  }

  return <ReactCookieFirst url={url}>{children}</ReactCookieFirst>;
}
