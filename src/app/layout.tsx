import '../styles/critical.css';
import '../styles/globals.css';

import Script from 'next/script';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

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
import { Footer, Header } from '@/components/shared/layout';
import {
  Body,
  Notifications,
  PathChecker,
} from '@/components/shared/layout/wrapper';
import { TooltipProvider } from '@/components/ui/tooltip';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const gaId = process.env.GA_ID;

  return (
    <html lang='el'>
      <Body>
        <TooltipProvider delayDuration={0}>
          <PathChecker excludes={['/dashboard', '/admin']}>
            <Header />
          </PathChecker>
          <main>
            <Notifications>{children}</Notifications>
          </main>
          <PathChecker excludes={['/dashboard', '/admin']}>
            <Footer />
          </PathChecker>
          <BottomToTop_D />
          <GoogleTagManager gtmId='GTM-KR7N94L4' />
          <GoogleAnalytics gaId={gaId} />
          {/* Cloudinary Upload Widget */}
          {/* <Script
            src='https://upload-widget.cloudinary.com/global/all.js'
            strategy='beforeInteractive'
          /> */}
          {/* <PathChecker excludes={'/admin'}>
            <CookiesBanner_D />
          </PathChecker> */}
        </TooltipProvider>
      </Body>
    </html>
  );
}
