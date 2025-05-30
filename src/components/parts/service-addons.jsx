'use client';

import React, { useEffect } from 'react';

import useServiceOrderStore from '@/stores/order/service';

import Buy from './service-buy';

export default function Addons({ addons, small, price, username }) {
  const { order, setOrder, calculateTotal } = useServiceOrderStore();

  const handleSelectAddons = (addon) => {
    const isExist = order.addons.some((a) => a.id === addon.id);

    if (!isExist) {
      setOrder({ addons: [...order.addons, addon] });
    } else {
      const newAddons = order.addons.filter((item) => item.id !== addon.id);

      setOrder({ addons: newAddons });
    }
    calculateTotal();
  };

  return (
    <div
      className={`pb-0 bg-white bdrs12 wow fadeInUp default-box-shadow1 ${
        !small ? 'px30 pt30 noshowmobile' : ''
      }`}
    >
      {!small && <div className='addons-total-price'>{price}€</div>}
      {!small && <h4>Extra Υπηρεσίες</h4>}
      <div className='extra-service-tab mb20 mt20'>
        <nav>
          <div className='nav flex-column nav-tabs'>
            {addons.map((addon, i) => (
              <button
                key={i}
                className={`${
                  !small
                    ? `nav-link p0 ${order.addons?.some((a) => a.id === addon.id) ? 'active' : ''}`
                    : 'small-addon'
                }`}
              >
                {!small ? (
                  <label className='custom_checkbox d-flex justify-content-between fw500 text-start m0'>
                    <div>
                      <h5 className='small-addon-title'>{addon.title}</h5>
                      <span className='text text-bottom'>
                        {addon.description}
                      </span>
                    </div>
                    <input
                      type='checkbox'
                      checked={order.addons?.some((a) => a.id === addon.id)}
                      onChange={() => handleSelectAddons(addon)}
                    />
                    <span className='checkmark' />
                    {!small && <span className='price'>+{addon.price}€</span>}
                  </label>
                ) : (
                  <label className='small-addon-container'>
                    <div className='small-addon-content'>
                      <h5 className='small-addon-title'>{addon.title}</h5>
                      <div className='small-addon-description'>
                        {addon.description}
                      </div>
                      <div className='small-addon-price'>+{addon.price}€</div>
                    </div>
                    <input
                      type='checkbox'
                      checked={order.addons?.some((a) => a.id === addon.id)}
                      onChange={() => handleSelectAddons(addon)}
                      className='small-addon-input'
                    />
                    <span className='small-addon-checkmark' />
                  </label>
                )}
              </button>
            ))}
          </div>
          {price && (
            <div className='pt10 pb20'>
              <Buy price={price} username={username} />
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
