import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";
import "react-loading-skeleton/dist/skeleton.css";

import BottomToTop from "@/components/button/BottomToTop";
import Header from "@/components/ui/Header";
import InstallBootstrap from "@/components/ui/InstallBootstrap";
import Body from "@/components/ui/Body";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Query from "@/components/query/Query";
import { ROOT_LAYOUT } from "@/lib/graphql/queries/main/global";

if (typeof window !== "undefined") {
  import("bootstrap");
}

export default async function RootLayout({ children }) {
  return (
    <html lang="el">
      <Body>
        <InstallBootstrap />
        <Query query={ROOT_LAYOUT}>
          {(data) => (
            <>
              <Header header={data.header} />
              <div className="wrapper mm-page mm-slideout">
                {children}
                <BottomToTop />
              </div>
            </>
          )}
        </Query>
        <SpeedInsights />
      </Body>
    </html>
  );
}
