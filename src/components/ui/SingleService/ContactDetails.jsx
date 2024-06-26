import UserImage from "@/components/user/UserImage";
import { inspect } from "@/utils/inspect";
import Image from "next/image";
import Link from "next/link";

export default function ContactDetails({
  firstName,
  lastName,
  displayName,
  username,
  tagline,
  rating,
  base,
  rate,
  image,
  totalFreelancerReviews,
}) {
  return (
    <>
      <div className="freelancer-style1 service-single mb-0">
        <div className="wrapper d-flex align-items-center">
          <div className="thumb position-relative mb25">
            <UserImage
              width={90}
              height={90}
              firstName={firstName}
              lastName={lastName}
              image={image}
              bigText
              path={`/freelancer/${username}`}
            />
          </div>
          <div className="ml20">
            <h5 className="title mb-1">{displayName}</h5>
            <p className="mb-0">{tagline}</p>
            {rating && (
              <div className="review">
                <p>
                  <i className="fas fa-star fz10 review-color pr10" />
                  <span className="dark-color">{rating}</span> (
                  {totalFreelancerReviews}) αξιολογήσεις
                </p>
              </div>
            )}
          </div>
        </div>
        <hr className="opacity-100" />
        <div className="details">
          <div className="fl-meta d-flex align-items-center justify-content-between">
            {base.area && (
              <div className="contact-meta-info">
                Περιοχή
                <br />
                <span className="fz14 fw400">
                  {base.area.data.attributes.name}
                </span>
              </div>
            )}

            {base.online === true && (
              <div className="contact-meta-info">
                Περιοχή
                <br />
                <span className="fz14 fw400">Online</span>
              </div>
            )}

            {rate && (
              <div className="contact-meta-info">
                Εγατοώρα
                <br />
                <span className="fz14 fw400">{rate}€ / ώρα</span>
              </div>
            )}

            {/* <div className="contact-meta-info">
              Job Success
              <br />
              <span className="fz14 fw400">%98</span>
            </div> */}
          </div>
        </div>
        <div className="d-grid mt30">
          <Link href="/freelancer-single" className="ud-btn btn-thm-border">
            Επικοινωνία
            <i className="fal fa-arrow-right-long" />
          </Link>
        </div>
      </div>
    </>
  );
}
