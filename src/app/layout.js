import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";
import "react-loading-skeleton/dist/skeleton.css";

import BottomToTop from "@/components/button/BottomToTop";
import { DM_Sans } from "next/font/google";
import Header from "@/components/ui/Header";
import SearchModal1 from "@/components/modal/SearchModal1";
import { footer } from "@/data/footer";
import { headers } from "next/headers";
import { getMaintenanceStatus } from "@/lib/maintenance/maintenance";
import { isAuthenticated } from "@/lib/auth/authenticated";
import InstallBootstrap from "@/components/ui/InstallBootstrap";
import Body from "@/components/ui/Body";
import Footer from "@/components/ui/Footer";
import { getUser } from "@/lib/user/user";
import NavMenuMobile from "@/components/ui/NavMenuMobile";
import { FOOTER, HEADER } from "@/lib/graphql/queries";
import { getData } from "@/lib/client/operations";

if (typeof window !== "undefined") {
  import("bootstrap");
}

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

export default async function RootLayout({ children }) {
  const headerList = headers();
  const path = headerList.get("x-current-path");

  const { isUnderMaintenance } = await getMaintenanceStatus();
  const { authenticated } = await isAuthenticated();
  const user = await getUser();

  const { header: headerData } = await getData(HEADER);
  const { footer: footerData } = await getData(FOOTER);

  return (
    <html lang="en">
      <Body path={path} dmSans={dmSans}>
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
      </Body>
    </html>
  );
}
