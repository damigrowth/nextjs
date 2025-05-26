import React from 'react';

import SearchSelect from '../../input/search-select';
import Switch from '../../input/switch';

export default function Coverage({ selectData }) {
  const countiesData = selectData.options[1] || [];

  const options = countiesData.map((el) => ({
    value: el.id,
    label: el.attributes.name,
  }));

  return (
    <div>
      <Switch
        paramName='cov_o'
        label={'Online'}
        noHeader
        id='coverage-online-switch'
      />
      <div className='mt-4'>
        <SearchSelect
          options={options}
          defaultLabel={selectData.defaultLabel[1]}
          paramOptionName={selectData.option[1]}
          paramSearchName={selectData.search[1]}
          paramPageName={selectData.page[1]}
          paramPageSizeName={selectData.pageSize[1]}
          pagination={selectData.pagination[1]}
          paramDisabledName={selectData.disabled}
        />
      </div>
    </div>
  );
}
