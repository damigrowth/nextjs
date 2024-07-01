import UserImage from "@/components/user/UserImage";
import { inspect } from "@/utils/inspect";
import Image from "next/image";
import Link from "next/link";
import Socials from "../socials/Socials";
import { getYearsOfExperience } from "@/utils/getYearsOfExperience";

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
  totalReviews,
  topLevel,
  socials,
  email,
  phone,
  website,
  type,
  category,
  commencement,
}) {
  const yearsOfExperience = getYearsOfExperience(commencement);
  return (
    <>
      <div className="freelancer-style1 service-single mb-0">
        <div className="wrapper d-flex align-items-center">
          <div className="thumb position-relative">
            <UserImage
              width={90}
              height={90}
              firstName={firstName}
              lastName={lastName}
              image={image}
              bigText
              path={`/freelancer/${username}`}
            />
            {topLevel && (
              <div className="top-badge">
                {/* <div className="icon ">
                      <span className="flaticon-badge" />
                    </div> */}
                <Image
                  width={30}
                  height={30}
                  src="/images/top-badge.png"
                  alt="top badge"
                />
              </div>
            )}
          </div>
          <div className="ml20">
            <Link href={`/freelancer/${username}`}>
              <h5 className="title mb-1">{displayName}</h5>
            </Link>
            <p className="mb-0">{tagline}</p>
            {rating && (
              <div className="review">
                <p>
                  <i className="fas fa-star fz10 review-color pr10" />
                  <span className="dark-color">{rating}</span>
                  <span className="ml5">
                    {totalReviews === 1
                      ? `(από ${totalReviews} αξιολόγηση)`
                      : `(από ${totalReviews} αξιολογήσεις)`}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-end mb-0  fz15 fw500 list-inline-item ml15 mb5-sm ml0-xs">
          <Socials
            socials={socials}
            email={email}
            phone={phone}
            website={website}
          />
        </div>
        <hr className="opacity-100" />
        <div className="details">
          <div className="fl-meta d-flex align-items-center justify-content-between">
            <div className="contact-meta-info left">
              {type?.data && (
                <span className="fz14 fw400">{type.data.attributes.label}</span>
              )}
              <br />
              {category?.data && (
                <span className="fz14 fw400">
                  {category.data.attributes.label}
                </span>
              )}
            </div>
            <div className="contact-meta-info right">
              {rate && <span className="fz14 fw400">{rate}€ / ώρα</span>}
              <br />
              {commencement && (
                <span className="fz14 fw400">
                  {yearsOfExperience} έτη εμπειρίας
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="d-grid mt30">
          <Link
            href={`/freelancer/${username}`}
            className="ud-btn btn-thm-border"
          >
            Επικοινωνία
            <i className="fal fa-arrow-right-long" />
          </Link>
        </div>
      </div>
    </>
  );
}
