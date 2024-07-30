import React from "react";
import SearchSelectSingle from "../../Inputs/SearchSelectSingle";

export default function Category({ categories }) {
  const options = categories.map((cat) => ({
    value: cat.attributes.slug,
    label: cat.attributes.label,
  }));

  return (
    <SearchSelectSingle
      defaultLabel="Όλες οι κατηγορίες"
      paramOptionName="cat"
      paramSearchName="cat_s"
      options={options}
      navigates
    />
  );
}
