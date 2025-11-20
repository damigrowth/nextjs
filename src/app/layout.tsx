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
import { Footer, HeaderFixed, HeaderRelative } from '@/components/shared/layout';
import {
  Body,
  Notifications,
  PathChecker,
} from '@/components/shared/layout/wrapper';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getNavigationMenuData } from '@/actions/services/get-categories';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  // Fetch navigation data at layout level (Server Component)
  const navDataResult = await getNavigationMenuData();
  const navigationData = navDataResult.success ? navDataResult.data : [];
  const gaId = process.env.GA_ID;

  return (
    <html lang='el' suppressHydrationWarning>
      <Body>
        <TooltipProvider delayDuration={0}>
          {/* Fixed header for homepage only */}
          <PathChecker paths={['/']}>
            <HeaderFixed navigationData={navigationData} />
          </PathChecker>

          {/* Relative header for all other pages (except dashboard/admin) */}
          <PathChecker excludes={['/', '/dashboard', '/admin']}>
            <HeaderRelative navigationData={navigationData} />
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
