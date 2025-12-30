import '../styles/critical.css';
import '../styles/globals.css';

import Script from 'next/script';
import { Metadata } from 'next';

// import 'react-tooltip/dist/react-tooltip.css';
// import 'react-loading-skeleton/dist/skeleton.css';
import {
  BottomToTop_D,
  CookiesBanner_D,
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
        {/* CookieFirst Cookie Consent Wrapper - TEMPORARILY DISABLED FOR TESTING */}
        {/* <CookiesBanner_D> */}
          <TooltipProvider delayDuration={0}>
            <main>
              <Notifications>{children}</Notifications>
            </main>
            {/* Footer is shown globally except for dashboard and admin */}
            <FooterWrapper />
            <BottomToTop_D />

            {/* Google Tag Manager - Deferred to reduce main-thread blocking */}
            <Script
              id='gtm-script'
              strategy='afterInteractive'
              dangerouslySetInnerHTML={{
                __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-KR7N94L4');
              `,
              }}
            />

            {/* Google Analytics - Deferred to reduce main-thread blocking */}
            {gaId && (
              <Script
                id='ga-script'
                strategy='afterInteractive'
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              />
            )}
            {gaId && (
              <Script
                id='ga-config'
                strategy='afterInteractive'
                dangerouslySetInnerHTML={{
                  __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
                }}
              />
            )}
            {/* Cloudinary Upload Widget */}
            {/* <Script
            src='https://upload-widget.cloudinary.com/global/all.js'
            strategy='beforeInteractive'
          /> */}
          </TooltipProvider>
        {/* </CookiesBanner_D> */}
      </Body>
    </html>
  );
}
