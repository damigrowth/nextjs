import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";
import "react-loading-skeleton/dist/skeleton.css";

import BottomToTop from "@/components/button/BottomToTop";
import Header from "@/components/ui/Header";
import InstallBootstrap from "@/components/ui/InstallBootstrap";
import Body from "@/components/ui/Body";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ROOT_LAYOUT } from "@/lib/graphql/queries/main/global";
import { getData } from "@/lib/client/operations";

if (typeof window !== "undefined") {
  import("bootstrap");
}

export const revalidate = 3600;

export default async function RootLayout({ children }) {
  const data = await getData(ROOT_LAYOUT);
  return (
    <html lang="el">
      <Body>
        <InstallBootstrap />
        <Header header={data.header} />
        <div className="wrapper mm-page mm-slideout">
          {children}
          <BottomToTop />
        </div>
        <SpeedInsights />
      </Body>
    </html>
  );
}
