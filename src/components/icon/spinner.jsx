import React from 'react';

export default function Spinner({ width, height, borderWidth }) {
  return (
    <div
      className='spinner-border'
      style={{
        width: !width ? '3rem' : width,
        height: !height ? '3rem' : height,
        borderWidth: !borderWidth ? '0.3rem' : borderWidth,
        display: 'flex',
      }}
      role='status'
    >
      <span className='sr-only'></span>
    </div>
  );
}
