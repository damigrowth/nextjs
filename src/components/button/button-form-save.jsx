'use client';

export default function SaveButton({
  hidden = false,
  isPending = false,
  disabled = false,
  hasChanges = false,
  loadingText = 'Ενημέρωση Στοιχείων...',
  defaultText = 'Ενημέρωση Στοιχείων',
  IconComponent = null,
  emoji = '',
  variant = 'dark',
  orientation = 'left',
  className = '',
  ...props
}) {
  if (hidden) return null;

  const isDisabled = !hasChanges || isPending || disabled;

  const buttonClasses = `
    ud-btn 
    ${variant === 'dark' ? 'btn-dark' : ''} 
    ${variant === 'primary' ? 'btn-thm' : ''} 
    ${variant === 'outline' ? 'btn-outline' : ''} 
    ${isDisabled ? `btn-${variant}-disabled` : ''} 
    mt20 
    no-rotate 
    text-center
    ${className}
  `.trim();

  return (
    <div className={`text-${orientation}`}>
      <button
        type='submit'
        disabled={isDisabled}
        className={buttonClasses}
        {...props}
      >
        {isPending ? loadingText : defaultText}
        {isPending ? (
          <div className='spinner-border spinner-border-sm ml10' role='status'>
            <span className='sr-only'></span>
          </div>
        ) : (
          <>{IconComponent ? <IconComponent /> : ` ${emoji}`}</>
        )}
      </button>
    </div>
  );
}
