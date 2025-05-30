import React from 'react';

import {
  ArchivesFreelancersContent,
  Category,
  Coverage,
  PaymentMethods,
  Skills,
} from '../archive/freelancer';
import { Verified } from '../parts';
import { Sidebar, SidebarModal } from '../sidebar';
import { ContentSkeletonFreelancers } from '../skeleton';
import { Pending } from '../wrapper';

export default function FreelancersArchive({
  taxonomies,
  // categories,
  // counties,
  searchParams,
  paramsFilters,
  selectData,
  multiSelectData,
  childPath,
}) {
  // Remove 'cov_c_s' from searchParams
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([key]) =>
        key !== 'cat_s' &&
        key !== 'skills_s' &&
        key !== 'skills_p' &&
        key !== 'skills_ps' &&
        key !== 'cov_c_s' &&
        key !== 'covc_p' &&
        key !== 'covc_ps' &&
        key !== 'cat_p' &&
        key !== 'cat_ps',
    ),
  );

  const filters = [
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
    /* { heading: "Εργατοώρα", params: ["min", "max"], component: <Rate /> }, */
    {
      heading: 'Περιοχές Εξυπηρέτησης',
      params: ['cov_o', 'cov_c'],
      component: <Coverage selectData={selectData} />,
    },
    {
      heading: 'Τρόποι Πληρωμής',
      params: ['pay_m'],
      component: <PaymentMethods />,
    },
    /* {
      heading: "Τρόποι Επικοινωνίας",
      params: ["con_t"],
      component: <ContactTypes />,
    }, */
    /* { heading: "Εμπειρία σε έτη", params: ["exp"], component: <Experience /> }, */
    /* { heading: "Top", params: ["top"], component: <Top /> }, */
    {
      heading: 'Δεξιότητες',
      params: ['skills'],
      component: <Skills selectData={multiSelectData} />,
    },
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
                fallback={<ContentSkeletonFreelancers />}
                keys={filteredSearchParams}
              >
                <ArchivesFreelancersContent
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
