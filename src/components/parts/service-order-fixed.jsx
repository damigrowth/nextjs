import React from 'react';

import Addons from './service-addons';
import Buy from './service-buy';

export default function OrderFixed({ price, addons, isOwner }) {
  return (
    <div className='price-widget'>
      {price > 0 && <div className='price'>{price}€</div>}
      {addons.length > 0 && <Addons addons={addons} small />}
      <div className='d-grid'>
        <Buy price={price} isOwner={isOwner} />
      </div>
    </div>
  );
}
