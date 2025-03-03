"use client";

export default function SaveButton({
  hidden = false,
  isPending = false,
  hasChanges = true,
  loadingText = "Ενημέρωση Στοιχείων...",
  defaultText = "Ενημέρωση Στοιχείων",
  icon = "fa-solid fa-floppy-disk",
  emoji = "",
  variant = "dark",
  orientation = "left",
  className = "",
  ...props
}) {
  if (hidden) return null;

  const isDisabled = !hasChanges || isPending;

  const buttonClasses = `
    ud-btn 
    ${variant === "dark" ? "btn-dark" : ""} 
    ${variant === "primary" ? "btn-thm" : ""} 
    ${variant === "outline" ? "btn-outline" : ""} 
    ${isDisabled ? `btn-${variant}-disabled` : ""} 
    mt20 
    no-rotate 
    text-center
    ${className}
  `.trim();

  return (
    <div className={`text-${orientation}`}>
      <button
        type="submit"
        disabled={isDisabled}
        className={buttonClasses}
        {...props}
      >
        {isPending ? loadingText : defaultText}
        {isPending ? (
          <div className="spinner-border spinner-border-sm ml10" role="status">
            <span className="sr-only"></span>
          </div>
        ) : (
          <>{icon ? <i className={icon}></i> : ` ${emoji}`}</>
        )}
      </button>
    </div>
  );
}
