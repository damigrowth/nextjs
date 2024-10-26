import React from "react";
import TaxonomiesSwiper from "./TaxonomiesSwiper";
import TaxonomiesGrid from "./TaxonomiesGrid";

export default function TaxonomiesArchive({ archive }) {
  return (
    <div className="taxonomies-archive">
      {archive.subdivisions && archive.subdivisions.length > 0 && (
        <TaxonomiesSwiper taxonomies={archive.subdivisions} />
      )}
      {archive.subcategories && archive.subcategories.length > 0 && (
        <TaxonomiesGrid taxonomies={archive.subcategories} />
      )}
    </div>
  );
}
