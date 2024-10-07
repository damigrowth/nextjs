import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function TaxonomiesGrid({ taxonomies }) {
  const fallbackImage = "/images/vector-img/vector-service-v1.png";

  return (
    <section className="pt0">
      <div className="container">
        <h2 className="mb40">Κατηγορίες</h2>
        <div className="taxonomies-grid">
          {taxonomies.map((taxonomy, index) => (
            <div key={index} className="taxonomies-grid-card">
              <div className="taxonomies-grid-image">
                <Image
                  layout="fill"
                  src={
                    taxonomy?.image?.data?.attributes?.formats?.small?.url ||
                    fallbackImage
                  }
                  alt="vector"
                />
              </div>
              <div className="taxonomies-grid-info">
                <Link
                  href={`/ipiresies/${taxonomy.category.data.attributes.slug}/${taxonomy.slug}`}
                >
                  <h3 className="taxonomies-grid-title">{taxonomy.label}</h3>
                </Link>
                <ul className="taxonomies-grid-list">
                  {taxonomy.subdivisions.data.map((subdivision, subIndex) => (
                    <li key={subIndex} className="taxonomies-grid-list-item">
                      <Link
                        href={`/ipiresies/${taxonomy.category.data.attributes.slug}/${taxonomy.slug}/${subdivision.attributes.slug}`}
                      >
                        {subdivision.attributes.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
