import React from "react";
import TaxonomiesSwiper from "./taxonomies-swiper";
import TaxonomiesGrid from "./taxonomies-grid";

export default function TaxonomiesArchive({ archive }) {
  const subcategoriesData = archive?.subcategories?.data || [];
  const subdivisionsData = archive?.subdivisions?.data || [];

  // Μετασχηματισμός των subcategories δεδομένων για το TaxonomiesGrid
  const formattedSubcategories = subcategoriesData.map((item) => ({
    ...item.attributes,
    image: item.attributes.image,
    subdivisions: {
      data: item.attributes.subdivisions.data,
    },
  }));

  // Μετασχηματισμός των subdivisions δεδομένων για το TaxonomiesSwiper
  const formattedSubdivisions = subdivisionsData.map((item) => ({
    ...item.attributes,
    subcategory: {
      data: {
        attributes: {
          slug: item.attributes.subcategory.data.attributes.slug,
        },
      },
    },
  }));

  return (
    <div className="taxonomies-archive">
      {formattedSubdivisions.length > 0 && (
        <TaxonomiesSwiper taxonomies={formattedSubdivisions} />
      )}
      {formattedSubcategories.length > 0 && (
        <TaxonomiesGrid taxonomies={formattedSubcategories} />
      )}
    </div>
  );
}
