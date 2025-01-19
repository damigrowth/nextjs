import ForgotPasswordForm from "@/components/ui/forms/ForgotPasswordForm";
import React from "react";

export default function page() {
  return (
    <section className="our-login">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 m-auto wow fadeInUp" data-wow-delay="300ms">
            <div className="main-title text-center">
              <h2 className="title">Ξέχασες τον κωδικό σου?</h2>
              <p className="paragraph">
                Γράψε το email σου, για να ανακτήσεις τον κωδικό.
              </p>
            </div>
          </div>
        </div>
        <div className="row wow fadeInRight" data-wow-delay="300ms">
          <div className="col-xl-6 mx-auto">
            <div className="log-reg-form search-modal form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
              <ForgotPasswordForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
