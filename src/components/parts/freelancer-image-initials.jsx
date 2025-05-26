import React from 'react';

export default function InitialsImage({
  displayName,
  firstName,
  lastName,
  width = '40px',
  height = '40px',
  bigText,
}) {
  const getInitials = () => {
    if (firstName && lastName) {
      return (
        firstName.slice(0, 1).toUpperCase() + lastName.slice(0, 1).toUpperCase()
      );
    }
    if (displayName) {
      const names = displayName.split(' ');

      return names.length > 1
        ? names[0].slice(0, 1).toUpperCase() +
            names[1].slice(0, 1).toUpperCase()
        : displayName.slice(0, 2).toUpperCase();
    }

    return '';
  };

  return (
    <div className='profile-image' style={{ width, height }}>
      <span
        className={bigText ? 'initials-image-text fz40' : 'initials-image-text'}
      >
        {getInitials()}
      </span>
    </div>
  );
}
