import Image from "next/image";
import React from "react";
import HeaderLogo from "../HeaderLogo";

export default function ServerDown() {
  return (
    <>
      <nav className="posr">
        <div className="container posr">
          <div className="row align-items-center justify-content-between">
            <div className="col-auto px-0 px-xl-3">
              <div className="d-flex align-items-center justify-content-between">
                <HeaderLogo />
              </div>
            </div>
          </div>
        </div>
      </nav>
      <section className="our-error">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-6 wow fadeInRight" data-wow-delay="300ms">
              <div className="animate_content text-center text-xl-start">
                <div className="animate_thumb">
                  <Image
                    height={500}
                    width={500}
                    className="w-100"
                    src="/images/icon/error-page-img.svg"
                    alt="error-page-img"
                  />
                </div>
              </div>
            </div>
            <div
              className="col-xl-5 offset-xl-1 wow fadeInLeft"
              data-wow-delay="300ms"
            >
              <div className="error_page_content text-center text-xl-start">
                <div className="erro_code">
                  50<span className="text-thm">3</span>
                </div>
                <div className="h2 error_title">
                  Ουπς! Σφάλμα, υπό κατασκευή.
                </div>
                <p className="text fz15 mb20">
                  Η σελίδα που αναζητάτε δεν είναι διαθέσιμη. Προσπαθήστε να
                  ψάξετε ξανά σε λίγα λεπτά.{" "}
                  <br className="d-none d-lg-block" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
