'use client';

import { useEffect, useState } from 'react';
import LinkNP from '@/components/link';

import useServiceOrderStore from '@/stores/order/service';

import Addons from './service-addons';
import { ArrowRightLong } from '@/components/icon/fa';
import { IconCheck, IconTimes } from '@/components/icon/fa';

const tabs = ['Απλό', 'Κανονικό', 'Προχωρημένο'];

export default function OrderPackages({
  packages,
  addons,
  serviceId,
  freelancerId,
  userId,
  username,
}) {
  const { order, setOrder, calculateTotal } = useServiceOrderStore();

  useEffect(() => {
    setOrder({
      buyer: userId,
      seller: freelancerId,
      service: serviceId,
      packages: [packages[0]],
      addons: [],
      fixed: false,
    });
    calculateTotal();
  }, [userId, freelancerId, serviceId, packages, setOrder, calculateTotal]);

  const handleSelectPackage = (pack) => {
    setOrder({ packages: [pack] });
    calculateTotal();
  };

  return (
    <>
      <div className='price-widget'>
        <div className='navtab-style1'>
          <nav>
            <div className='nav nav-tabs small-packages-nav-tabs'>
              {packages.map((pack, i) => (
                <button
                  onClick={() => handleSelectPackage(pack)}
                  key={i}
                  className={`nav-link fw500 ${order.packages[0]?.id === pack.id ? 'active' : ''}`}
                >
                  {pack.title}
                </button>
              ))}
            </div>
          </nav>
          <div className='tab-content' id='nav-tabContent'>
            {packages.map((pack, i) => (
              <div key={i}>
                {order.packages[0]?.id === pack.id && (
                  <div className='price-content'>
                    <div className='price'>{pack.price}€</div>
                    <div className='h5 mb-2'>{pack.description}</div>
                    {/* <p className="text fz14">
                      I will redesign your current landing page or create one
                      for you (upto 4 sections)
                    </p> */}
                    <hr className='opacity-100 mb20' />
                    {/* <ul className="p-0 mb15 d-sm-flex align-items-center">
                      <li className="fz14 fw500 dark-color">
                        <i className="flaticon-sandclock fz20 text-thm2 me-2 vam" />
                        3 Days Delivery
                      </li>
                      <li className="fz14 fw500 dark-color ml20 ml0-xs">
                        <i className="flaticon-recycle fz20 text-thm2 me-2 vam" />
                        2 Revisions
                      </li>
                    </ul> */}
                    <div className='list-style1'>
                      <ul className='mb0 pb0'>
                        {pack.features
                          .sort((a, b) => a.isCheckField - b.isCheckField)
                          .map((feature, i) => (
                            <li
                              key={i}
                              className='mb15'
                              style={
                                feature.isCheckField
                                  ? { marginLeft: '0rem' }
                                  : { marginLeft: '-2rem' }
                              }
                            >
                              {feature.isCheckField ? (
                                feature.checked ? (
                                  <IconCheck className='text-thm3 bgc-thm3-light' />
                                ) : (
                                  <IconTimes className='text-red bgc-red-light' />
                                )
                              ) : // <span>{feature.value}</span>
                              null}
                              {feature.isCheckField
                                ? feature.title
                                : feature.value + ' ' + feature.title}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {addons.length > 0 && <Addons addons={addons} small />}
        <div className='d-grid'>
          <LinkNP href={`/profile/${username}`} className='ud-btn btn-thm'>
            Αγορά {order.total}€
            <ArrowRightLong />
          </LinkNP>
        </div>
      </div>
    </>
  );
}
