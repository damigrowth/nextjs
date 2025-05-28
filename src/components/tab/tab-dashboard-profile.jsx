import React from 'react';

export default function Tab({ index, content }) {
  return (
    <div data-tab={`${index}`} key={index}>
      <div className='row'>
        <div className='col-xl-12'>
          <div className='ps-widget lshadow bgc-white bdrs4 p30 mb30 position-relative'>
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
