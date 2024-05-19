import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";

import BottomToTop from "@/components/button/BottomToTop";
import { DM_Sans } from "next/font/google";
import Footer14 from "@/components/footer/Footer14";
import Header from "@/components/header/Header";
import NavSidebar from "@/components/sidebar/NavSidebar";
import SearchModal1 from "@/components/modal/SearchModal1";
import { footer } from "@/data/footer";
import { headers } from "next/headers";
import { sidebarEnable } from "@/data/header";
import toggleStore from "@/store/toggleStore";
import { usePathname } from "next/navigation";
import { getMaintenanceStatus } from "@/lib/maintenance/maintenance";
import { isAuthenticated } from "@/lib/auth/authenticated";

if (typeof window !== "undefined") {
  import("bootstrap");
}

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

export default async function RootLayout({ children }) {
  const headersList = headers();
  const path = headersList.get("x-invoke-path") || "";

  const { isUnderMaintenance } = await getMaintenanceStatus();
  const { authenticated } = await isAuthenticated();

  return (
    <html lang="en">
      <body
        className={`${dmSans.className} ${
          path === "/register" || path === "/login"
            ? "bgc-thm4 mm-wrapper mm-wrapper--position-left-front"
            : sidebarEnable.includes(path)
            ? isListingActive
              ? "menu-hidden-sidebar-content"
              : ""
            : ""
        }`}
      >
        {!footer.includes(path) ? (
          <div className="wrapper ovh mm-page mm-slideout">
            {(!isUnderMaintenance || authenticated) && <Header />}
            <SearchModal1 />
            <div className="body_content">
              {children}
              {(!isUnderMaintenance || authenticated) && <Footer14 />}
              <BottomToTop />
            </div>
          </div>
        ) : (
          <div className="wrapper mm-page mm-slideout">
            {children}
            <BottomToTop />
          </div>
        )}
        <NavSidebar />
      </body>
    </html>
  );
}
