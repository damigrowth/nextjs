import React from "react";
import SearchSelectSingle from "../../Inputs/SearchSelectSingle";

export default function Category({ currCategory, categories }) {
  const options = categories.map((cat) => ({
    value: cat.attributes.slug,
    label: cat.attributes.plural,
  }));

  return (
    <SearchSelectSingle
      rootLabel="Όλες οι κατηγορίες"
      defaultLabel={currCategory ? `${currCategory}` : "Όλες οι κατηγορίες"}
      paramOptionName="cat"
      paramSearchName="cat_s"
      options={options}
      parentPathLink="profiles"
      navigates
    />
  );
}
