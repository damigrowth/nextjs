import ResetPasswordForm from "@/components/ui/forms/ResetPasswordForm";

export default function page({ searchParams }) {
  const resetCode = searchParams?.code || "";

  return (
    <section className="our-register">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 m-auto wow fadeInUp" data-wow-delay="300ms">
            <div className="main-title text-center">
              <h2 className="title">Νέος κωδικός πρόσβασης</h2>
              <p className="paragraph">
                Επαναφορά κωδικού πρόσβασης. Εισάγετε τον νέο κωδικό σας.
              </p>
            </div>
          </div>
        </div>
        <div className="row wow fadeInRight" data-wow-delay="300ms">
          <div className="col-xl-6 mx-auto">
            <div className="log-reg-form search-modal form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
              <ResetPasswordForm resetCode={resetCode} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
