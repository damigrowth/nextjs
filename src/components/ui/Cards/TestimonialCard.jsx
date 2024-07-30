import UserImage from "@/components/user/UserImage";
import Image from "next/image";
import React from "react";

export default function TestimonialCard({
  title,
  comment,
  image,
  firstName,
  lastName,
  displayName,
  category,
}) {
  return (
    <div className="testimonial-style1 default-box-shadow1 position-relative bdrs16">
      <div className="testimonial-content">
        <h4 className="title text-thm">{title}</h4>
        <span className="icon fas fa-quote-left" />
        <h4 className="t_content">{comment}</h4>
      </div>
      <div className="thumb d-flex align-items-center">
        <div className="flex-shrink-0">
          {/* <UserImage
            image={image}
            width="60"
            height="60"
            alt="testimonial-user-image"
            firstName={firstName}
            lastName={lastName}
            displayName={displayName}
          /> */}
          <Image
            height={60}
            width={60}
            className="wa h-100 w-100 object-fit-cover"
            src={image}
            alt="avatar"
          />
        </div>
        <div className="flex-grow-1 ms-3">
          <h6 className="mb-0">{displayName}</h6>
          <p className="fz14 mb-0">{category}</p>
        </div>
      </div>
    </div>
  );
}
