import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";
import "react-loading-skeleton/dist/skeleton.css";

import BottomToTop from "@/components/button/BottomToTop";
import InstallBootstrap from "@/components/ui/InstallBootstrap";
import Body from "@/components/ui/Body";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Link from "next/link";

export const revalidate = 3600;

const links = [
  { href: "/ipiriesies", label: "ipiresies" },
  { href: "/ipiriesies2", label: "ipiresies2" },
  { href: "/ipiriesies3", label: "ipiresies3" },
  { href: "/ipiriesies4", label: "ipiresies4" },
  { href: "/ipiriesies5", label: "ipiresies5" },
  { href: "/ipiriesies6", label: "ipiresies6" },
];

export default function RootLayout({ children }) {
  return (
    <html lang="el">
      <Body>
        <InstallBootstrap />
        <nav>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              scroll={false}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="wrapper mm-page mm-slideout">
          {children}
          <BottomToTop />
        </div>
        <SpeedInsights />
      </Body>
    </html>
  );
}
