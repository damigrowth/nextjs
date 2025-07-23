import '../styles/critical.css';
import '../styles/globals.css';

import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; /* eslint-disable import/first */

// import 'react-tooltip/dist/react-tooltip.css';
// import 'react-loading-skeleton/dist/skeleton.css';
import {
  BottomToTop_D,
  CookiesBanner_D,
  // NavMenuMobileWrapper_D,
} from '@/components/dynamic';
import { Footer, Header } from '@/components/layout';
import { Body, Notifications, PathChecker } from '@/components/layout/wrapper';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const gaId = process.env.GA_ID;

  return (
    <html lang='el'>
      <Body>
        {/* <InstallBootstrap /> */}
        <div className='overflow-hidden box-border min-h-screen bg-inherit relative z-[1] w-full transition-all duration-[0.4s] ease-in-out'>
          <PathChecker excludes={['/dashboard', '/admin']}>
            <Header />
          </PathChecker>
          <div>
            <Notifications>{children}</Notifications>
            <PathChecker excludes={['/dashboard', '/admin']}>
              <Footer />
            </PathChecker>
            <BottomToTop_D />
          </div>
        </div>
        {/* <PathChecker excludes={['/dashboard', '/admin']}>
          <NavMenuMobileWrapper_D />
        </PathChecker> */}
        <GoogleTagManager gtmId='GTM-KR7N94L4' />
        <GoogleAnalytics gaId={gaId} />
        <PathChecker excludes={'/admin'}>
          <CookiesBanner_D />
        </PathChecker>
      </Body>
    </html>
  );
}
