import SearchBar from "./SearchBar";
import PopularSearches from "./PopularSearches";

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
    <div className="home12-hero-content">
      <span className="d-inline-block tag animate-up-1 mb15">
        Κατάλογος Υπηρεσιών
      </span>
      <h1 className="animate-up-1 mb25">
        Οι καλύτεροι επαγγελματίες
        <br />
        στην οθόνη σου.
      </h1>
      <h2 className="text animate-up-2">
        Ανακάλυψε Υπηρεσίες από τους Καλύτερους Επαγγελματίες.
      </h2>
      <SearchBar categories={categories} subcategories={subcategories} />
      <PopularSearches subcategories={subcategories} />
    </div>
  );
}
