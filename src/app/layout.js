import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { Footer } from '@/components/footer';
import { InstallBootstrap } from '@/components/global';
import { Header } from '@/components/header';
import { Body, PathChecker } from '@/components/wrapper';
import Notifications from '@/components/wrapper/wrapper-notifications';
import { ApolloWrapper } from '@/lib/client/apollo-wrapper';
import { getData } from '@/lib/client/operations';
import { ROOT_LAYOUT_WITH_ACTIVE_SERVICES } from '@/lib/graphql';

import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; /* eslint-disable import/first */

import './globals.css';
import 'react-tooltip/dist/react-tooltip.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { getUser } from '@/actions/shared/user';
import {
  BottomToTop_D,
  CookiesBanner_D,
  NavMenuMobileWrapper_D,
} from '@/components/dynamic';

if (typeof window !== 'undefined') {
  import('bootstrap');
}

export const dynamic = 'force-dynamic';

export const revalidate = 86400;

export default async function RootLayout({ children }) {
  const isUnderMaintenance = false;

  const user = await getUser();

  const authenticated = user ? true : false;

  const { header: headerData } = await getData(
    ROOT_LAYOUT_WITH_ACTIVE_SERVICES,
    null,
    'HEADER',
  );

  const gaId = process.env.GA_ID;

  const freelancerId = user?.freelancer?.data?.id;

  return (
    <html lang='el'>
      <Body>
        <InstallBootstrap />
        <div className='wrapper ovh mm-page mm-slideout'>
          {(!isUnderMaintenance || authenticated) && (
            <PathChecker excludes='/dashboard'>
              <Header user={user} header={headerData} />
            </PathChecker>
          )}
          <div className='body_content'>
            <ApolloWrapper>
              <Notifications freelancerId={freelancerId}>
                {children}
              </Notifications>
            </ApolloWrapper>
            {(!isUnderMaintenance || authenticated) && (
              <PathChecker excludes='/dashboard'>
                <Footer />
              </PathChecker>
            )}
            <BottomToTop_D />
          </div>
        </div>
        <PathChecker excludes='/dashboard'>
          <NavMenuMobileWrapper_D header={headerData} />
        </PathChecker>
        <SpeedInsights />
        <GoogleTagManager gtmId='GTM-KR7N94L4' />
        <GoogleAnalytics gaId={gaId} />
        <CookiesBanner_D />
      </Body>
    </html>
  );
}
