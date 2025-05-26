'use client';

import { useState } from 'react';

export default function FaqSuggestion({ title, faq }) {
  const [activeItem, setActiveItem] = useState(0);

  const toggleAccordion = (index) => {
    setActiveItem(index === activeItem ? null : index);
  };

  return (
    <div className='ui-content pb30'>
      <h4 className='title'>{title}</h4>
      <div className='accordion-style1 faq-page mb-4 mb-lg-5'>
        <div className='accordion' id='accordionExample'>
          {faq.map((item, index) => (
            <div key={index} className='accordion-item'>
              <h2 className='accordion-header' id={`heading${index}`}>
                <button
                  className={`accordion-button justify-content-between ${
                    activeItem === index ? '' : 'collapsed'
                  }`}
                  type='button'
                  onClick={() => toggleAccordion(index)}
                >
                  {item.question}
                </button>
              </h2>
              <div
                id={`collapse${index}`}
                className={`accordion-collapse collapse ${activeItem === index ? 'show' : ''}`}
                aria-labelledby={`heading${index}`}
                data-bs-parent='#accordion'
              >
                <div className='accordion-body'>{item.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
