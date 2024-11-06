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
import { checkServerHealth, getData } from "@/lib/client/operations";
import { ROOT_LAYOUT } from "@/lib/graphql/queries/main/global";
import ServerDown from "@/components/ui/Errors/ServerDown";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { isAuthenticated } from "@/lib/auth/authenticated";
import { getUser } from "@/lib/user/user";
import { ApolloWrapper } from "@/lib/client/apollo-wrapper";

if (typeof window !== "undefined") {
  import("bootstrap");
}

export default async function RootLayout({ children, params }) {
  // const { serverStatus } = await checkServerHealth();

  // if (!serverStatus)
  //   return (
  //     <html>
  //       <body>
  //         <ServerDown />
  //       </body>
  //     </html>
  //   );

  const isUnderMaintenance = false;

  const { authenticated } = await isAuthenticated();
  const user = await getUser();

  const { header: headerData } = await getData(ROOT_LAYOUT);

  const gaId = process.env.GA_ID;

  const isFooterPath = footer.includes(params.path);

  return (
    <html lang="el">
      <Body path={params.path}>
        <InstallBootstrap />
        {!isFooterPath ? (
          <div className="wrapper ovh mm-page mm-slideout">
            {(!isUnderMaintenance || authenticated) && (
              <Header
                authenticated={authenticated}
                user={user}
                header={headerData}
              />
            )}
            <div className="body_content">
              <ApolloWrapper>{children}</ApolloWrapper>
              {(!isUnderMaintenance || authenticated) && <Footer />}
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

export async function generateStaticParams() {
  // Generate static params for all possible paths
  const paths = [
    { path: "" },
    { path: "register" },
    { path: "login" },
    ...footer.map((path) => ({ path: path.slice(1) })),
  ];

  return paths;
}
