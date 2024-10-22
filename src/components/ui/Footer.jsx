import Link from "next/link";
import React from "react";
import Image from "next/image";
import Socials from "./Socials";

export default async function Footer({ footer }) {
  const companyLinks = footer.data.attributes.company.data;
  const categoryLinks = footer.data.attributes.categories.data;

  const accountLinks = [
    {
      label: "Σύνδεση",
      slug: "/login",
    },
    {
      label: "Εγγραφή",
      slug: "/register",
    },
    {
      label: "Καταχώριση Υπηρεσίας",
      slug: "/add-services",
    },
  ];

  return (
    <>
      <section className="footer-style1 at-home2 pb-0 pt60">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="footer-widget mb-4 mb-lg-5">
                <div className="row justify-content-between">
                  <div className="col-auto">
                    <div className="link-style1 mb-3">
                      <h6 className="text-white mb25">Σχετικά</h6>
                      <div className="link-list">
                        {companyLinks.map((item, i) => (
                          <Link key={i} href={`/co/${item.attributes.slug}`}>
                            {item.attributes.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="link-style1 mb-3">
                      <h6 className="text-white mb25">Υπηρεσίες</h6>
                      <ul className="ps-0">
                        {categoryLinks.map((item, i) => (
                          <li key={i}>
                            <Link href={`/ipiresies/${item.attributes.slug}`}>
                              {item.attributes.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="link-style1 mb-3">
                      <h6 className="text-white mb25">Ο Λογαριασμός μου</h6>
                      <ul className="ps-0">
                        {accountLinks.map((item, i) => (
                          <li key={i}>
                            <Link href={item.slug}>{item.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-xl-4 offset-xl-2">
              <div className="footer-widget mb-4 mb-lg-5">
                <Link className="footer-logo" href="/">
                  <Image
                    height={45}
                    width={123}
                    className="mb40 object-fit-contain"
                    src="/images/doulitsa-logo-white.svg"
                    alt="Doulitsa logo"
                  />
                </Link>
                <div className="row mb-4 mb-lg-5">
                  <div className="col-auto">
                    <div className="contact-info">
                      <p className="info-title mb-2">Έχετε ερωτήσεις?</p>
                      <h5 className="info-mail">
                        <a
                          className="text-white"
                          href="mailto:contact@doulitsa.gr"
                        >
                          contact@doulitsa.gr
                        </a>
                      </h5>
                    </div>
                  </div>
                </div>
                <Socials />
              </div>
            </div>
          </div>
        </div>
        <div className="container white-bdrt1 py-4">
          <div className="row">
            <div className="col-sm-6">
              <div className="text-center text-lg-start">
                <p className="copyright-text mb-2 mb-md-0 text-white-light ff-heading">
                  © Doulitsa 2024 All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
