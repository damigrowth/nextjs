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

export const revalidate = 3600;

export default async function RootLayout({ children }) {
  // const data = await getData(ROOT_LAYOUT);

  // const categories = data.header.data.attributes.categories.data.map(
  //   (item, i) => ({
  //     id: i + 1,
  //     label: item.attributes.label,
  //     slug: item.attributes.slug,
  //     icon: item.attributes.icon,
  //     subcategories: item.attributes.subcategories.data.map((subcategory) => ({
  //       label: subcategory.attributes.label,
  //       slug: subcategory.attributes.slug,
  //       subdivisions: subcategory.attributes.subdivisions.data.map(
  //         (subdivision) => ({
  //           label: subdivision.attributes.label,
  //           slug: subdivision.attributes.slug,
  //         })
  //       ),
  //     })),
  //   })
  // );

  return (
    <html lang="el">
      <Body>
        <InstallBootstrap />
        {/* <Header categories={categories} /> */}
        <div className="wrapper mm-page mm-slideout">
          {children}
          <BottomToTop />
        </div>
        <SpeedInsights />
      </Body>
    </html>
  );
}

if (typeof window !== "undefined") {
  import("bootstrap");
}
