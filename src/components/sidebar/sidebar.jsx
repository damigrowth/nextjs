import React from 'react';

import ClearBtn from '../button/button-clear_';

export default function Sidebar({ filters, searchParams }) {
  return (
    <div className='list-sidebar-style1 d-none d-lg-block'>
      <div className='accordion' id='accordionExample'>
        {filters.map((filter, index) => {
          const paramsArray = filter.params.map(
            (paramName) => searchParams[paramName],
          );

          const hasParams = paramsArray.some(
            (param) => param !== undefined && param !== null,
          );

          const hasChildPath = filter.childPath !== undefined;

          const isCollapsed =
            index !== 0 && !hasParams && !hasChildPath && !filter.noCollapse;

          if (filter.noCollapse) {
            return (
              <div className='card mb20 pb10 mt-0' key={index}>
                {filter.component}
              </div>
            );
          }

          return (
            <div className='card mb20 pb10 mt-0' key={index}>
              <button
                className={`btn btn-link ps-0 pt-0 ${isCollapsed ? 'collapsed' : ''}`}
                type='button'
                data-bs-toggle='collapse'
                data-bs-target={`#collapse${index}`}
                aria-expanded={!isCollapsed ? 'true' : 'false'}
                aria-controls={`collapse${index}`}
              >
                <div
                  className='dropdown dropdown-toggle archive-dropdown'
                  id={`heading${index}`}
                >
                  <h4 className='archive-filters-title'>{filter.heading}</h4>
                </div>
              </button>
              <div
                id={`collapse${index}`}
                className={`collapse ${!isCollapsed ? 'show' : ''}`}
                aria-labelledby={`heading${index}`}
                data-parent='#accordionExample'
              >
                {filter.component}
              </div>
            </div>
          );
        })}
      </div>
      <ClearBtn />
    </div>
  );
}
