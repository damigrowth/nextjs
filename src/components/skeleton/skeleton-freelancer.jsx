import React from 'react';
import Skeleton from 'react-loading-skeleton';

import StickySidebar from '../sidebar/sidebar-sticky';

export default function FreelancerProfileSkeleton() {
  return (
    <>
      <section className='categories_list_section overflow-hidden'>
        <div className='container'>
          <div className='row'>
            <div className='col-lg-12'>
              <div className='listings_category_nav_list_menu'>
                <div className='mb0 d-flex ps-0'>
                  <Skeleton
                    width={1000}
                    height={25}
                    borderRadius={12}
                    style={{ marginBottom: '8px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className='breadcumb-section bg-white'>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-8 col-lg-10'>
              <div className='breadcumb-style1 mb10-xs'>
                <div className='breadcumb-list'>
                  <Skeleton width={400} height={25} borderRadius={12} />
                </div>
              </div>
            </div>
            <div className='col-sm-4 col-lg-2'>
              <div className='d-flex align-items-center justify-content-sm-end'>
                <Skeleton
                  width={29}
                  height={29}
                  borderRadius={60}
                  style={{ marginRight: '10px' }}
                />
                <Skeleton
                  width={100}
                  height={20}
                  borderRadius={12}
                  style={{ marginRight: '20px' }}
                />
                <Skeleton
                  width={29}
                  height={29}
                  borderRadius={60}
                  style={{ marginRight: '10px' }}
                />
                <Skeleton width={100} height={20} borderRadius={12} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className='pt10 pb90 pb30-md'>
        <div className='container'>
          <div className='row wow fadeInUp'>
            <div className='col-lg-8'>
              <div className='cta-service-v1 freelancer-single-v1 pt30 pb30 bdrs16 position-relative overflow-hidden mb30 d-flex align-items-center'>
                <div className='row wow fadeInUp'>
                  <div className='col-xl-12'>
                    <div className='position-relative pl50 pl20-sm'>
                      <div className='list-meta d-sm-flex align-items-center'>
                        <div className='position-relative freelancer-single-style'>
                          <Skeleton
                            width={90}
                            height={91}
                            borderRadius={'20%'}
                          />
                        </div>
                        <div className='ml20 ml0-xs'>
                          <div className='d-flex align-items-center'>
                            <h1 className='heading-h5 title m0 p0 pr5'>
                              <Skeleton
                                width={113}
                                height={20}
                                borderRadius={12}
                              />
                            </h1>
                          </div>
                          <h2 className='heading-p mb-0'>
                            <Skeleton
                              width={140}
                              height={13}
                              borderRadius={12}
                            />
                          </h2>
                          <Skeleton width={100} height={13} borderRadius={12} />
                          <Skeleton width={190} height={13} borderRadius={12} />
                          <div className='mb-0 dark-color fz15 fw500 list-inline-item mb5-sm ml0-xs'>
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className='d-inline-block mr5'>
                                <Skeleton
                                  width={30}
                                  height={30}
                                  borderRadius={100}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='row'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='col-sm-6 col-xl-3'>
                    <div className='iconbox-style1 contact-style d-flex align-items-start mb30'>
                      <div className='icon flex-shrink-0'>
                        <Skeleton width={40} height={40} borderRadius={'20%'} />
                      </div>
                      <div className='details'>
                        <h5 className='title fw600'>
                          <Skeleton width={100} height={15} borderRadius={12} />
                        </h5>
                        <div className='mb-0 text'>
                          <Skeleton width={100} height={11} borderRadius={12} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className='service-about'>
                <h4>
                  <Skeleton width={113} height={20} borderRadius={12} />
                </h4>
                <div className='freelancer-description text mb30'>
                  {[1, 2, 3].map((i) => (
                    <div className='mb10' key={i}>
                      <Skeleton width={'75%'} height={15} borderRadius={12} />
                      <Skeleton width={'95%'} height={15} borderRadius={12} />
                      <Skeleton width={'55%'} height={15} borderRadius={12} />
                    </div>
                  ))}
                  {[1, 2].map((i) => (
                    <div className='mb10' key={i}>
                      <Skeleton width={'35%'} height={15} borderRadius={12} />
                      <Skeleton width={'65%'} height={15} borderRadius={12} />
                      <Skeleton width={'55%'} height={15} borderRadius={12} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <StickySidebar>
              <div className='price-widget pt25 bdrs8'>
                <h3 className='widget-title mb30 d-flex align-items-end'>
                  <Skeleton width={45} height={30} borderRadius={12} />
                  <small className='fz15 fw500 ml5'>
                    <Skeleton width={65} height={15} borderRadius={12} />
                  </small>
                </h3>
                <div className='category-list mt20'>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className='list-item d-flex align-items-center justify-content-between bdrb1 pb-2 mb15'
                    >
                      <div className='text d-flex align-items-center'>
                        <Skeleton
                          width={25}
                          height={25}
                          borderRadius={10}
                          style={{ marginRight: '5px', marginBottom: '10px' }}
                        />
                        <Skeleton
                          width={Math.floor(Math.random() * (85 - 10 + 1)) + 45}
                          height={15}
                          borderRadius={12}
                        />
                      </div>
                      <Skeleton
                        width={Math.floor(Math.random() * (85 - 20 + 1)) + 30}
                        height={12}
                        borderRadius={12}
                      />
                    </div>
                  ))}
                </div>
                <div className='d-grid mt30'>
                  <Skeleton width={308} height={59} borderRadius={5} />
                </div>
              </div>
            </StickySidebar>
          </div>
        </div>
      </section>
    </>
  );
}
