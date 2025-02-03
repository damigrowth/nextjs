import Socials from "@/components/ui/Socials";
import { firstColumnLinks } from "@/data/global/footer";
import Image from "next/image";
import Link from "next/link";

export default function DashboardFooter() {
  return (
    <>
      <footer className="dashboard_footer footer-style1 pt30 pb30">
        <div className="container">
          <div className="row justify-content-between">
            <div className="link-style1 mb-3 col-auto">
              <h6 className="mb10">
                <Link href={"/about"} className="text-white">
                  Σχετικά
                </Link>
              </h6>
              <div className="link-list">
                {firstColumnLinks.map((item, i) => (
                  <Link key={i} href={`/${item.attributes.slug}`}>
                    {item.attributes.title}
                  </Link>
                ))}
              </div>
            </div>
            <div className="footer-info col-auto">
              <div className="socials-info col-auto">
                <Socials />
              </div>
              <div className="contact-info col-auto">
                <p className="mb-2 text-white">Έχετε ερωτήσεις?</p>
                <h5 className="info-mail ">
                  <a className="text-white" href="mailto:contact@doulitsa.gr">
                    contact@doulitsa.gr
                  </a>
                </h5>
              </div>
            </div>
          </div>
        </div>
        <div className="container white-bdrt1 py-4">
          <div className="row">
            <div className="col-sm-6">
              <div className="text-center text-lg-start">
                <p className="copyright-text mb-2 mb-md-0 text-white-light ff-heading">
                  © Doulitsa 2025 All rights reserved.
                </p>
              </div>
            </div>
            <div className="col-sm-6 text-end">
              <Link className="footer-logo" href="/">
                <Image
                  height={45}
                  width={123}
                  className="mb40 object-fit-contain"
                  src="/images/doulitsa-logo-white.svg"
                  alt="Doulitsa logo"
                />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
