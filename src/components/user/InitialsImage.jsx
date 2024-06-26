import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function InitialsImage({
  firstName,
  lastName,
  width,
  height,
  bigText,
}) {
  const initials =
    firstName.slice(0, 1).toUpperCase() + lastName.slice(0, 1).toUpperCase();

  return (
    <div
      className="profile-image"
      style={{
        width: !width ? "40px" : width,
        height: !height ? "40px" : height,
      }}
    >
      <span className={bigText ? "w-42 fz40" : "w-42"}>{initials}</span>
    </div>
  );
}
