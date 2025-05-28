import React from 'react';

import { FaqSuggestion } from '@/components/section';

export default function FaqContent({ data }) {
  return (
    <section className='our-faq pb50'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-6 m-auto wow fadeInUp' data-wow-delay='300ms'>
            <div className='main-title text-center'>
              <h2 className='title'>{data.title}</h2>
              <p className='paragraph mt10'>{data.description}</p>
            </div>
          </div>
        </div>
        <div className='row wow fadeInUp' data-wow-delay='300ms'>
          <div className='col-lg-8 mx-auto'>
            {data.faq.map((item, index) => (
              <div key={index}>
                <FaqSuggestion key={index} title={item.title} faq={item.faq} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
