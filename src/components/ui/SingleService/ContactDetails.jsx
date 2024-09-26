import UserImage from "@/components/user/UserImage";
import { inspect } from "@/utils/inspect";
import Image from "next/image";
import Link from "next/link";
import Socials from "../socials/Socials";
import { getYearsOfExperience } from "@/utils/getYearsOfExperience";
import { formatRating } from "@/utils/formatRating";
import Rating from "@/components/user/Rating";
import VerifiedBadge from "@/components/user/VerifiedBadge";

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
  verified,
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
              path={`/profile/${username}`}
              topLevel={topLevel}
            />
          </div>
          <div className="ml20">
            <Link
              href={`/profile/${username}`}
              className="d-flex align-items-center"
            >
              <h5 className="title mb-1 mr5">{displayName}</h5>
              <VerifiedBadge verified={verified} />
            </Link>
            <p className="mb-0">{tagline}</p>
            <Rating totalReviews={totalReviews} rating={rating} />
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
          <Link href={`/profile/${username}`} className="ud-btn btn-thm-border">
            Επικοινωνία
            <i className="fal fa-arrow-right-long" />
          </Link>
        </div>
      </div>
    </>
  );
}
