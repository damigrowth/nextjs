"use client";

import React from "react";
import TaxonomiesSwiper from "./TaxonomiesSwiper";
import TaxonomiesGrid from "./TaxonomiesGrid";

export default function TaxonomiesArchive({ archive }) {
  const { subcategories, subdivisions } = archive;

  return (
    <>
      {subdivisions.length > 0 && (
        <TaxonomiesSwiper taxonomies={subdivisions} />
      )}
      {subcategories.length > 0 && (
        <TaxonomiesGrid taxonomies={subcategories} />
      )}
    </>
  );
}
