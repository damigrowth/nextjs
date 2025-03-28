import AuthTypeOptions from "@/components/ui/forms/AuthTypeOptions";
import Link from "next/link";
import RegisterForm from "@/components/ui/forms/RegisterForm";
import RegisterHeading from "@/components/ui/forms/RegisterHeading";
import { Meta } from "@/utils/Seo/Meta/Meta";

// Static SEO
export async function generateMetadata() {
  const { meta } = await Meta({
    titleTemplate: "Εγγραφή - Doulitsa",
    descriptionTemplate: "Δημιούργησε τον λογαριασμό σου στην Doulitsa και ξεκίνησε να προσφέρεις ή να αναζητάς υπηρεσίες.",
    size: 160,
    url: "/register",
  });

  return meta;
}

export default function page() {
  return (
    <section className="our-register">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 m-auto wow fadeInUp" data-wow-delay="300ms">
            <div className="main-title text-center">
              <h2 className="title">Εγγραφή</h2>
              <p className="paragraph">
                Δημιουργία νέου λογαριασμού με λίγα μόνο βήματα
              </p>
            </div>
          </div>
        </div>
        <div className="row wow fadeInRight" data-wow-delay="300ms">
          <div className="col-xl-6 mx-auto">
            <div className="log-reg-form search-modal searchbrd form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
              <div className="mb30">
                <RegisterHeading />
                <p className="text mt20">
                  Έχεις ήδη λογαριασμό?{" "}
                  <Link href="/login" className="text-thm">
                    Σύνδεση!
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
  );
}
