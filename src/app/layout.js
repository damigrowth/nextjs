import '../styles/critical.css';
import '../styles/globals.css';

import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
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

import 'react-tooltip/dist/react-tooltip.css';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  BottomToTop_D,
  CookiesBanner_D,
  NavMenuMobileWrapper_D,
} from '@/components/dynamic';

export default async function RootLayout({ children }) {
  // const isUnderMaintenance = false;

  // Cache header data for better performance
  const { header: headerData } = await getData(
    ROOT_LAYOUT_WITH_ACTIVE_SERVICES,
    null,
    'HEADER',
    ['header'],
  );

  const gaId = process.env.GA_ID;

  return (
    <html lang='el'>
      <Body>
        <InstallBootstrap />
        <div className='wrapper ovh mm-page mm-slideout'>
          <PathChecker excludes='/dashboard'>
            <Header header={headerData} />
          </PathChecker>
          <div className='body_content'>
            <ApolloWrapper>
              <Notifications>{children}</Notifications>
            </ApolloWrapper>
            <PathChecker excludes='/dashboard'>
              <Footer />
            </PathChecker>
            <BottomToTop_D />
          </div>
        </div>
        <PathChecker excludes='/dashboard'>
          <NavMenuMobileWrapper_D header={headerData} />
        </PathChecker>
        <GoogleTagManager gtmId='GTM-KR7N94L4' />
        <GoogleAnalytics gaId={gaId} />
        <CookiesBanner_D />
      </Body>
    </html>
  );
}
