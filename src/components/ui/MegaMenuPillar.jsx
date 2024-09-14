import Link from "next/link";
import React from "react";

export default function MegaMenuPillar({ subcategory }) {
  return (
    <div>
      <Link
        className="h6 p0 mb10 fz15 fw600"
        href={`/ipiresies/${subcategory.slug}`}
      >
        {subcategory.label}
      </Link>
      <ul className="ps-0 mb40">
        {subcategory.subdivisions.map((subdivision, i) => (
          <li key={i}>
            <Link href={`/ipiresies/${subcategory.slug}/${subdivision.slug}`}>
              {subdivision.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
