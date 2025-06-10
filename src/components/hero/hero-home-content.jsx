import Link from 'next/link';

import PopularSearches from './hero-home-popular-searches';
import SearchBar from './hero-home-search-bar';

export default function HeroContent({ categories }) {
  let subcategories = [];

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

  return (
    <div className='home12-hero-content'>
      <span className='d-inline-block tag mb15 fit'>
        <Link
          href='/categories'
          className='text-decoration-none text-white hover:text-white'
        >
          Κατάλογος Υπηρεσιών
        </Link>
      </span>
      <h1 className='mb25'>
        Οι καλύτερες Υπηρεσίες
        <br />
        στην οθόνη σου.
      </h1>
      <h2 className='heading-p'>
        Άμεση αναζήτηση υπηρεσιών από Επαγγελματίες και Επιχειρήσεις.
      </h2>
      <SearchBar categories={categories} subcategories={subcategories} />
      <PopularSearches subcategories={subcategories} />
    </div>
  );
}
