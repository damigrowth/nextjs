import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";
import "react-loading-skeleton/dist/skeleton.css";

import BottomToTop from "@/components/button/BottomToTop";
import Header from "@/components/ui/Header";
import InstallBootstrap from "@/components/ui/InstallBootstrap";
import Body from "@/components/ui/Body";
import Footer from "@/components/ui/Footer";
import { getData } from "@/lib/client/operations";
import { ROOT_LAYOUT_WITH_ACTIVE_SERVICES } from "@/lib/graphql/queries/main/global";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ApolloWrapper } from "@/lib/client/apollo-wrapper";
import { CookiesBanner } from "@/components/ui/banners/CookiesBanner";
import { getUser } from "@/lib/auth/user";
import PathChecker from "@/components/ui/PathChecker";
import NavMenuMobileWrapper from "@/components/ui/NavMenuMobileWrapper";
import Notifications from "@/components/providers/Notifications";

if (typeof window !== "undefined") {
  import("bootstrap");
}

export const dynamic = "force-dynamic";
export const revalidate = 86400;

export default async function RootLayout({ children }) {
  const isUnderMaintenance = false;

  const user = await getUser();
  const authenticated = user ? true : false;

  const { header: headerData } = await getData(
    ROOT_LAYOUT_WITH_ACTIVE_SERVICES,
    null,
    "HEADER"
  );

  const gaId = process.env.GA_ID;

  const freelancerId = user?.freelancer?.data?.id;

  return (
    <html lang="el">
      <Body>
        <InstallBootstrap />
        <div className="wrapper ovh mm-page mm-slideout">
          {(!isUnderMaintenance || authenticated) && (
            <PathChecker excludes="/dashboard">
              <Header user={user} header={headerData} />
            </PathChecker>
          )}
          <div className="body_content">
            <ApolloWrapper>
              <Notifications freelancerId={freelancerId}>
                {children}
              </Notifications>
            </ApolloWrapper>
            {(!isUnderMaintenance || authenticated) && (
              <PathChecker excludes="/dashboard">
                <Footer />
              </PathChecker>
            )}
            <BottomToTop />
          </div>
        </div>
        <PathChecker excludes="/dashboard">
          <NavMenuMobileWrapper header={headerData} />
        </PathChecker>
        <SpeedInsights />
        <GoogleTagManager gtmId="GTM-KR7N94L4" />
        <GoogleAnalytics gaId={gaId} />
        <CookiesBanner />
      </Body>
    </html>
  );
}
