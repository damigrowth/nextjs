import AuthTypeOptions from "@/components/ui/forms/AuthTypeOptions";
import Link from "next/link";
import RegisterForm from "@/components/ui/forms/RegisterForm";
import RegisterHeading from "@/components/ui/forms/RegisterHeading";

export default function page() {
  return (
    <>
      <section className="our-register">
        <div className="container">
          <div className="row">
            <div
              className="col-lg-6 m-auto wow fadeInUp"
              data-wow-delay="300ms"
            >
              <div className="main-title text-center">
                <h2 className="title">Εγγραφή</h2>
                <p className="paragraph">
                  Δημιουργήστε τον λογαριασμό σας μόνο με λίγα βήματα
                </p>
              </div>
            </div>
          </div>
          <div className="row wow fadeInRight" data-wow-delay="300ms">
            <div className="col-xl-6 mx-auto">
              <div className="log-reg-form search-modal form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
                <div className="mb30">
                  <RegisterHeading />
                  <p className="text mt20">
                    Έχετε ήδη λογαριασμό?{" "}
                    <Link href="/login" className="text-thm">
                      Συνδεθείτε!
                    </Link>
                  </p>
                </div>
                <AuthTypeOptions />
                <RegisterForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
