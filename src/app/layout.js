import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";
import "react-loading-skeleton/dist/skeleton.css";

import BottomToTop from "@/components/button/BottomToTop";
import Header from "@/components/ui/Header";
import { footer } from "@/data/footer";
import InstallBootstrap from "@/components/ui/InstallBootstrap";
import Body from "@/components/ui/Body";
import Footer from "@/components/ui/Footer";
import NavMenuMobile from "@/components/ui/NavMenuMobile";
import { getData } from "@/lib/client/operations";
import { ROOT_LAYOUT } from "@/lib/graphql/queries/main/global";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ApolloWrapper } from "@/lib/client/apollo-wrapper";
import { headers } from "next/headers";
import { CookiesBanner } from "@/components/ui/banners/CookiesBanner";
import { getUser } from "@/lib/auth/user";
import PathChecker from "@/components/ui/PathChecker";

if (typeof window !== "undefined") {
  import("bootstrap");
}

export default async function RootLayout({ children }) {
  const isUnderMaintenance = false;

  const user = await getUser();
  const authenticated = user ? true : false;

  const { header: headerData } = await getData(ROOT_LAYOUT, null, "HEADER");

  const gaId = process.env.GA_ID;

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
            <ApolloWrapper>{children}</ApolloWrapper>
            {(!isUnderMaintenance || authenticated) && (
              <PathChecker>
                <Footer />
              </PathChecker>
            )}
            <BottomToTop />
          </div>
        </div>
        <PathChecker excludes="/dashboard">
          <NavMenuMobile header={headerData} />
        </PathChecker>
        <SpeedInsights />
        <GoogleAnalytics gaId={gaId} />
        <CookiesBanner />
      </Body>
    </html>
  );
}
