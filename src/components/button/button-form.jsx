import React from 'react';
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { ArrowRightLong } from '@/components/icon/fa';

export default function FormButton({
  type,
  disabled,
  loading,
  onClick,
  text,
  icon,
}) {
  const renderIcon = () => {
    if (loading) {
      return (
        <div className='spinner-border spinner-border-sm ml10' role='status'>
          <span className='sr-only'></span>
        </div>
      );
    }
    switch (icon) {
      case 'arrow':
        return <ArrowRightLong />;
      case 'save':
        return <FontAwesomeIcon icon={faFloppyDisk} />;
      default:
        return null;
    }
  };

  return (
    <button
      type={type}
      className='ud-btn btn-thm form-button'
      disabled={disabled}
      onClick={onClick}
    >
      {loading ? `${text}...` : text}
      {renderIcon()}
    </button>
  );
}
