import React from "react";

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
        <div className="spinner-border spinner-border-sm ml10" role="status">
          <span className="sr-only"></span>
        </div>
      );
    }

    switch (icon) {
      case "arrow":
        return <i className="fal fa-arrow-right-long" />;
      case "save":
        return <i className="fa-solid fa-floppy-disk" />;
      default:
        return null;
    }
  };

  return (
    <button
      type={type}
      className="ud-btn btn-thm form-button"
      disabled={disabled}
      onClick={onClick}
    >
      {loading ? `${text}...` : text}
      {renderIcon()}
    </button>
  );
}
