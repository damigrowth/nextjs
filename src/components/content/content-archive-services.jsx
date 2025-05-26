import React from 'react';

import {
  ArchivesServicesContent,
  Category,
  Price,
  Verified,
} from '../archive/service';
import { Sidebar, SidebarModal } from '../sidebar';
import { ContentSkeletonServices } from '../skeleton';
import Pending from '../wrapper/pending';

export default function ServicesArchive({
  taxonomies,
  searchParams,
  paramsFilters,
  childPath,
  selectData,
  // multiSelectData,
}) {
  // Remove 'cat_s' from searchParams
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([key]) =>
        key !== 'cat_s' &&
        key !== 'tags_s' &&
        key !== 'tags_p' &&
        key !== 'tags_ps' &&
        key !== 'cov_c_s' &&
        key !== 'covc_p' &&
        key !== 'covc_ps' &&
        key !== 'cat_p' &&
        key !== 'cat_ps',
    ),
  );

  const filters = [
    { heading: 'Τιμή', params: ['min', 'max'], component: <Price /> },
    {
      heading: 'Πιστοποιημένα Προφίλ',
      params: ['ver'],
      component: <Verified />,
      noCollapse: true,
    },
    {
      heading: 'Κατηγορία',
      params: ['cat'],
      childPath,
      component: <Category selectData={selectData} />,
    },
    // {
    //   heading: "Tags",
    //   params: ["tags"],
    //   component: <Tags selectData={multiSelectData} />,
    // },
    /* { heading: "Χρόνος παράδοσης", params: ["time"], component: <Time /> }, */
  ];

  return (
    <>
      <section id='archive' className='pt30 pb90 bg-orange'>
        <div className='container'>
          <div className='row data-loading-section'>
            <div className='col-lg-3'>
              <Sidebar filters={filters} searchParams={searchParams} />
            </div>
            <div className='col-lg-9 archive-content'>
              <Pending
                fallback={<ContentSkeletonServices />}
                keys={filteredSearchParams}
              >
                <ArchivesServicesContent
                  paramsFilters={paramsFilters}
                  taxonomies={taxonomies}
                />
              </Pending>
            </div>
          </div>
        </div>
      </section>
      <SidebarModal filters={filters} searchParams={searchParams} />
    </>
  );
}
