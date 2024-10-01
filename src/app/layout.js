import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";
import "react-loading-skeleton/dist/skeleton.css";

import BottomToTop from "@/components/button/BottomToTop";
import Header from "@/components/ui/Header";
// import SearchModal1 from "@/components/modal/SearchModal1";
import { footer } from "@/data/footer";
import { headers } from "next/headers";
// import { getMaintenanceStatus } from "@/lib/maintenance/maintenance";
import { isAuthenticated } from "@/lib/auth/authenticated";
import InstallBootstrap from "@/components/ui/InstallBootstrap";
import Body from "@/components/ui/Body";
import Footer from "@/components/ui/Footer";
import { getUser } from "@/lib/user/user";
import NavMenuMobile from "@/components/ui/NavMenuMobile";
import { checkServerHealth, getData } from "@/lib/client/operations";
import { ROOT_LAYOUT } from "@/lib/graphql/queries/main/global";
import ServerDown from "@/components/ui/Errors/ServerDown";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const revalidate = 3600;

if (typeof window !== "undefined") {
  import("bootstrap");
}

export default async function RootLayout({ children }) {
  const { serverStatus } = await checkServerHealth();

  if (!serverStatus)
    return (
      <html>
        <body>
          <ServerDown />
        </body>
      </html>
    );

  const headerList = headers();
  const path = headerList.get("x-current-path");

  const isUnderMaintenance = false;
  // const { isUnderMaintenance } = await getMaintenanceStatus();
  const { authenticated } = await isAuthenticated();
  const user = await getUser();

  const { header: headerData, footer: footerData } = await getData(ROOT_LAYOUT);

  const gaId = process.env.GA_ID;

  return (
    <html lang="el">
      <Body path={path}>
        <InstallBootstrap />
        {!footer.includes(path) ? (
          <div className="wrapper ovh mm-page mm-slideout">
            {(!isUnderMaintenance || authenticated) && (
              <Header
                authenticated={authenticated}
                user={user}
                header={headerData}
              />
            )}
            {/* <SearchModal1 /> */}
            <div className="body_content">
              {children}
              {(!isUnderMaintenance || authenticated) && (
                <Footer footer={footerData} />
              )}
              <BottomToTop />
            </div>
          </div>
        ) : (
          <div className="wrapper mm-page mm-slideout">
            {children}
            <BottomToTop />
          </div>
        )}
        <NavMenuMobile header={headerData} />
        <SpeedInsights />
        <GoogleAnalytics gaId={gaId} />
      </Body>
    </html>
  );
}
