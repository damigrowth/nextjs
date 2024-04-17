// "use client";

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

if (typeof window !== "undefined") {
  import("bootstrap");
}

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

export default function RootLayout({ children }) {
  // const isListingActive = toggleStore((state) => state.isListingActive);
  // const path = usePathname();

  const headersList = headers();
  const path = headersList.get("x-invoke-path") || "";

  // wow js
  // useEffect(() => {
  //   const { WOW } = require("wowjs");
  //   const wow = new WOW({
  //     live: false,
  //   });
  //   wow.init();
  // }, [path]);

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
            {/* {header1.find(
              (elm) => elm?.split("/")[1] == path?.split("/")[1]
            ) && <Header1 />}
            {header2.find(
              (elm) => elm?.split("/")[1] == path?.split("/")[1]
            ) && <Header2 />}
            {header3.find(
              (elm) => elm?.split("/")[1] == path?.split("/")[1]
            ) && <Header3 />}
            {header4.find(
              (elm) => elm?.split("/")[1] == path?.split("/")[1]
            ) && <Header4 />}
            {header5.find(
              (elm) => elm?.split("/")[1] == path?.split("/")[1]
            ) && <Header5 />}
            {header6.find(
              (elm) => elm?.split("/")[1] == path?.split("/")[1]
            ) && <Header6 />}
            {header7.find(
              (elm) => elm?.split("/")[1] == path?.split("/")[1]
            ) && <Header7 />}
            {header8.find(
              (elm) => elm?.split("/")[1] == path?.split("/")[1]
            ) && <Header8 />}
            {header9.find(
              (elm) => elm?.split("/")[1] == path?.split("/")[1]
            ) && <Header9 />}
            {header10.find(
              (elm) => elm?.split("/")[1] == path?.split("/")[1]
            ) && <Header10 />}
            {header11.find(
              (elm) => elm?.split("/")[1] == path?.split("/")[1]
            ) && <Header11 />} */}

            <Header />

            <SearchModal1 />

            <div className="body_content">
              {children}
              {/* footer */}
              {/* {path === "/home-4" ||
              path === "/home-7" ||
              path === "/home-13" ? (
                <Footer2 />
              ) : path === "/home-5" ? (
                <Footer3 />
              ) : path === "/home-8" ? (
                <Footer4 />
              ) : path === "/home-9" ? (
                <Footer5 />
              ) : path === "/home-12" ? (
                <Footer12 />
              ) : path === "/home-14" ? (
                <Footer14 />
              ) : path === "/home-15" ? (
                <Footer15 />
              ) : path === "/home-18" ? (
                <Footer18 />
              ) : path === "/home-20" ? (
                <Footer20 />
              ) : (
                path !== "/service-7" && path !== "/invoices" && <Footer />
              )} */}
              <Footer14 />

              {/* bottom to top */}
              <BottomToTop />
            </div>
          </div>
        ) : (
          <div className="wrapper mm-page mm-slideout">
            {children}
            {/* bottom to top */}
            <BottomToTop />
          </div>
        )}

        {/* sidebar mobile navigation */}
        <NavSidebar />
      </body>
    </html>
  );
}
