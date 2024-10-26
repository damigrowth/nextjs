import React from "react";
import SearchSelectSingle from "../../Inputs/SearchSelectSingle";

export default function Category({ selectData }) {
  const optionsData = selectData.options.map((cat) => ({
    value: cat.attributes.slug,
    label: cat.attributes.label,
  }));

  return (
    <SearchSelectSingle
      rootLabel={selectData.rootLabel}
      defaultLabel={selectData.defaultLabel}
      paramOptionName={selectData.option}
      paramSearchName={selectData.search}
      paramPageName={selectData.page}
      paramPageSizeName={selectData.pageSize}
      pagination={selectData.pagination}
      options={optionsData}
      navigates
    />
  );
}
