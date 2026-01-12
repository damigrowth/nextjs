import '../styles/critical.css';
import '../styles/globals.css';

import Script from 'next/script';
import { Metadata } from 'next';

// import 'react-tooltip/dist/react-tooltip.css';
// import 'react-loading-skeleton/dist/skeleton.css';
import {
  BottomToTop_D,
  // NavMenuMobileWrapper_D,
} from '@/components/dynamic';
import { FooterWrapper } from '@/components/shared/layout';
import { Body, Notifications } from '@/components/shared/layout/wrapper';
import { TooltipProvider } from '@/components/ui/tooltip';
import NavigationSkeletonOverlay from '@/components/shared/navigation-skeleton-overlay';

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
        {/* CookieFirst loads via Google Tag Manager - no React wrapper needed */}
        <TooltipProvider delayDuration={0}>
            {/* Global navigation skeleton overlay */}
            <NavigationSkeletonOverlay />
            <main>
              <Notifications>{children}</Notifications>
            </main>
            {/* Footer is shown globally except for dashboard and admin */}
            <FooterWrapper />
            <BottomToTop_D />

            {/* Google Tag Manager & Analytics - User-interaction based loading for TBT optimization */}
            {/* Only loads after first user interaction (scroll, click, touch) or after 5s idle */}
            <Script
              id='gtm-ga-loader'
              strategy='afterInteractive'
              dangerouslySetInnerHTML={{
                __html: `
                (function() {
                  let loaded = false;

                  function loadGTMAndGA() {
                    if (loaded) return;
                    loaded = true;

                    // Load GTM
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','GTM-KR7N94L4');

                    ${gaId ? `
                    // Load Google Analytics
                    var gaScript = document.createElement('script');
                    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=${gaId}';
                    gaScript.async = true;
                    document.head.appendChild(gaScript);

                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${gaId}');
                    ` : ''}
                  }

                  // Load on first user interaction
                  const events = ['scroll', 'click', 'touchstart', 'mousemove', 'keydown'];
                  const loadOnce = function() {
                    loadGTMAndGA();
                    events.forEach(e => window.removeEventListener(e, loadOnce));
                  };
                  events.forEach(e => window.addEventListener(e, loadOnce, { passive: true, once: true }));

                  // Fallback: Load after 5 seconds if no interaction
                  setTimeout(loadGTMAndGA, 5000);
                })();
              `,
              }}
            />
            {/* Cloudinary Upload Widget */}
            {/* <Script
            src='https://upload-widget.cloudinary.com/global/all.js'
            strategy='beforeInteractive'
          /> */}
          </TooltipProvider>
      </Body>
    </html>
  );
}
