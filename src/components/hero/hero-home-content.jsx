import Link from 'next/link';

import PopularSearches from './hero-home-popular-searches';
import SearchBar from './hero-home-search-bar';

export default function HeroContent({ categories }) {
  let subcategories = [];

  if (categories && categories.length > 0) {
    categories.forEach((cat) => {
      if (cat.attributes && cat.attributes.subcategories) {
        cat.attributes.subcategories.data.forEach((sub) => {
          subcategories.push({
            label: sub.attributes.label,
            slug: sub.attributes.slug,
            categorySlug: cat.attributes.slug,
          });
        });
      }
    });
    subcategories = subcategories.slice(0, 6);
  }

  return (
    <>
      {/* Only render search functionality - static content moved to Hero */}
      <SearchBar categories={categories || []} subcategories={subcategories} />
      <PopularSearches subcategories={subcategories} />
    </>
  );
}
