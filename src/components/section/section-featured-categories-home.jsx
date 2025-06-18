import React from 'react';
// import BrowserCategoryCard1 from "../card/BrowserCategoryCard1";
import LinkNP from '@/components/link';

import { categoriesClassNames } from '../../constants/data';
import FeaturedCategoriesSwiper from './section-featured-categories-swiper';
import { ArrowRightLong } from '@/components/icon/fa';

export default async function FeaturedCategories({ categories }) {
  const featuredCategories = categories.map((item, i) => ({
    ...item,
    classNames: categoriesClassNames[i % categoriesClassNames.length],
  }));

  return (
    <section className='pb40-md pt20 pb90'>
      <div className='container'>
        <div
          className='row align-items-center wow fadeInUp'
          data-wow-delay='300ms'
        >
          <div className='col-lg-9'>
            <div className='main-title2'>
              <h2 className='title'>Κατηγορίες</h2>
              <p className='paragraph'>Ανακάλυψε 100+ κατηγορίες υπηρεσιών.</p>
            </div>
          </div>
          <div className='col-lg-3'>
            <div className='text-start text-lg-end mb-4 mb-lg-2'>
              <LinkNP className='ud-btn2' href='/categories'>
                Όλες οι Κατηγορίες
                <ArrowRightLong />
              </LinkNP>
            </div>
          </div>
        </div>
        <div className='row d-none d-lg-flex wow fadeInUp'>
          {featuredCategories.map((item, i) => (
            <div key={i} className={item.classNames}>
              <div className='iconbox-style1 at-home12-v2'>
                <LinkNP href={`/categories/${item.attributes.slug}`}>
                  <div className='icon'>
                    <span className={item.attributes.icon}></span>
                  </div>
                </LinkNP>
                <div className='details mt20'>
                  {/* <p className="text mb5">{item.skills} skills</p> */}
                  <h4 className='title'>
                    <LinkNP href={`/categories/${item.attributes.slug}`}>
                      {item.attributes.label}
                    </LinkNP>
                  </h4>
                  <p className='mb-0'>
                    {item.attributes.subcategories.data
                      .slice(0, 3)
                      .map((sub, i) => (
                        <span key={i}>
                          <LinkNP href={`/ipiresies/${sub.attributes.slug}`}>
                            {sub.attributes.label}
                          </LinkNP>
                          {i < 2 &&
                          i < item.attributes.subcategories.data.length - 1
                            ? ', '
                            : ''}
                        </span>
                      ))}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <FeaturedCategoriesSwiper categories={featuredCategories} />
      </div>
    </section>
  );
}
