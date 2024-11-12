import React from "react";
import SearchSelect from "../../Inputs/SearchSelect";

export default function Category({ selectData }) {
  const optionsData = selectData.options.map((cat) => ({
    value: cat.attributes.slug,
    label: cat.attributes.label,
  }));

  return (
    <SearchSelect
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
