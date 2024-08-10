import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function ServiceCardImage({ image, path }) {
  return (
    <Link href={path}>
      <div className="list-thumb flex-shrink-0 height">
        <Image
          height={245}
          width={329}
          className="w-100 h-100 object-fit-cover"
          src={image}
          alt="image"
        />
      </div>
    </Link>
  );
}
