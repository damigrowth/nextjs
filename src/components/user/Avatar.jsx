import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Avatar({ firstName, lastName, avatar }) {
  const initials =
    firstName.slice(0, 1).toUpperCase() + lastName.slice(0, 1).toUpperCase();

  return (
    <div className="profile-image">
      <Link href="/dashboard" className="">
        {avatar != "" ? (
          <Image
            src={avatar}
            alt="Profile Picture"
            className="img-fluid rounded-circle"
            width={43}
            height={43}
          />
        ) : (
          <span className="w-42 h-30">{initials}</span>
        )}
      </Link>
    </div>
  );
}
