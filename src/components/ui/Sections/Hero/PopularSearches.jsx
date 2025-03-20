import Link from "next/link";

export default function PopularSearches({ subcategories }) {
  return (
    <>
      <p className="animate-up-2 dark-color ff-heading mt30 mb15">
        Δημοφιλείς Αναζητήσεις
      </p>
      <div className="home9-tags at-home12 d-md-flex align-items-center animate-up-4">
        {subcategories.map((sub, i) => (
          <Link
            href={`/ipiresies/${sub.slug}`}
            key={i}
            className="bdrs60 mb-md-0 searchbrd"
          >
            {sub.label}
          </Link>
        ))}
      </div>
    </>
  );
}
