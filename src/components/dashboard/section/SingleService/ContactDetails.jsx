import UserImage from "@/components/user/UserImage";
import Image from "next/image";
import Link from "next/link";

export default function ContactDetails({ freelancer, freelancerId, area }) {
  return (
    <>
      <div className="freelancer-style1 service-single mb-0">
        <div className="wrapper d-flex align-items-center">
          <div className="thumb position-relative mb25">
            <UserImage
              width={90}
              height={90}
              firstName={freelancer.firstName}
              lastName={freelancer.lastName}
              image={freelancer.image.data?.attributes?.formats?.thumbnail?.url}
            />
          </div>
          <div className="ml20">
            <h5 className="title mb-1">{freelancer.displayName}</h5>
            <p className="mb-0">Occupation title</p>
            <div className="review">
              <p>
                <i className="fas fa-star fz10 review-color pr10" />
                <span className="dark-color">4.9</span> (595 reviews)
              </p>
            </div>
          </div>
        </div>
        <hr className="opacity-100" />
        <div className="details">
          <div className="fl-meta d-flex align-items-center justify-content-between">
            <div className="contact-meta-info">
              Περιοχή
              <br />
              <span className="fz14 fw400">{area}</span>
            </div>
            <div className="contact-meta-info">
              Rate
              <br />
              <span className="fz14 fw400">$90 / ώρα</span>
            </div>
            <div className="contact-meta-info">
              Job Success
              <br />
              <span className="fz14 fw400">%98</span>
            </div>
          </div>
        </div>
        <div className="d-grid mt30">
          <Link href="/freelancer-single" className="ud-btn btn-thm-border">
            Contact Me
            <i className="fal fa-arrow-right-long" />
          </Link>
        </div>
      </div>
    </>
  );
}
