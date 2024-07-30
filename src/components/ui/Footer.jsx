import Link from "next/link";
import React from "react";
import FooterSocial5 from "../footer/FooterSocial5";
import Image from "next/image";
import { about, category, support } from "@/data/footer";
import Socials from "./Socials";
import { getData } from "@/lib/client/operations";
import { FOOTER } from "@/lib/graphql/queries";

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
                <div className="mailchimp-widget mb90">
                  <h6 className="title text-white mb20">Subscribe</h6>
                  {/* HYDRATION ERROR */}
                  {/* <div className="mailchimp-style1 at-home9 bdrs60 overflow-hidden">
                
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Your email address"
                  />
                  <button className="text-white" type="submit">
                    Send
                  </button>
                </div> */}
                </div>
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
                    height={40}
                    width={133}
                    className="mb40 object-fit-contain"
                    src="/images/header-logo-white.svg"
                    alt="logo"
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
