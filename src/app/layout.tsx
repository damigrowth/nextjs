import '../styles/critical.css';
import '../styles/globals.css';

import Script from 'next/script';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { Metadata } from 'next';

import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; /* eslint-disable import/first */

// import 'react-tooltip/dist/react-tooltip.css';
// import 'react-loading-skeleton/dist/skeleton.css';
import {
  BottomToTop_D,
  // CookiesBanner_D,
  // NavMenuMobileWrapper_D,
} from '@/components/dynamic';
import { FooterWrapper } from '@/components/shared/layout';
import { Body, Notifications } from '@/components/shared/layout/wrapper';
import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: {
    default: 'Doulitsa - Βρες Επαγγελματίες και Υπηρεσίες για Κάθε Ανάγκη',
    template: '%s | Doulitsa',
  },
  description: 'Ανακάλυψε εξειδικευμένους επαγγελματίες και υπηρεσίες από όλη την Ελλάδα.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const gaId = process.env.GA_ID;

  return (
    <html lang='el' suppressHydrationWarning>
      <head>
        {/* Resource hints for Cloudinary image optimization */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <Body>
        <TooltipProvider delayDuration={0}>
          <main>
            <Notifications>{children}</Notifications>
          </main>
          {/* Footer is shown globally except for dashboard and admin */}
          <FooterWrapper />
          <BottomToTop_D />
          <GoogleTagManager gtmId='GTM-KR7N94L4' />
          <GoogleAnalytics gaId={gaId} />
          {/* Cloudinary Upload Widget */}
          {/* <Script
            src='https://upload-widget.cloudinary.com/global/all.js'
            strategy='beforeInteractive'
          /> */}
          {/* <CookiesBanner_D /> */}
        </TooltipProvider>
      </Body>
    </html>
  );
}
