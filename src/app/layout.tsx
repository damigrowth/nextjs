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
import { Footer, Header } from '@/components/layout';
import { Body, Notifications, PathChecker } from '@/components/layout/wrapper';
import { AuthProvider } from '@/components/providers/auth';
import { Toaster } from '@/components/ui/sonner';
import { getCurrentUser } from '@/actions/auth/server';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const gaId = process.env.GA_ID;

  // Get initial auth data on server
  const userResult = await getCurrentUser();

  const initialUser = userResult.success ? userResult.data.user : null;
  const initialProfile = userResult.success ? userResult.data.profile : null;
  const initialSession = userResult.success ? userResult.data.session : null;

  return (
    <html lang='el'>
      <Body>
        <AuthProvider
          initialUser={initialUser}
          initialProfile={initialProfile}
          initialSession={initialSession}
        >
          {/* <InstallBootstrap /> */}
          <div className='overflow-hidden box-border min-h-screen bg-inherit relative z-[1] w-full'>
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
        </AuthProvider>
        {/* <PathChecker excludes={['/dashboard', '/admin']}>
          <NavMenuMobileWrapper_D />
        </PathChecker> */}
        <GoogleTagManager gtmId='GTM-KR7N94L4' />
        <GoogleAnalytics gaId={gaId} />
        {/* Cloudinary Upload Widget */}
        <Script
          src='https://upload-widget.cloudinary.com/global/all.js'
          strategy='beforeInteractive'
        />
        {/* <PathChecker excludes={'/admin'}>
          <CookiesBanner_D />
        </PathChecker> */}
        <Toaster />
      </Body>
    </html>
  );
}
