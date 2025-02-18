"use client";

export default function CheckSelect({
  options = [],
  selectedValues = {},
  onChange,
  name,
  error,
  label,
  disabled = false,
  maxSelections,
  className = "",
  horizontal,
  showSelectionsCount = false,
}) {
  // Get actual array of selected values, handling different structures
  const getSelectedIds = () => {
    if (Array.isArray(selectedValues)) {
      return selectedValues;
    }
    if (selectedValues?.data && Array.isArray(selectedValues.data)) {
      return selectedValues.data.map((item) => item.id);
    }
    return [];
  };

  const selectedIds = getSelectedIds();

  // Handle checkbox change
  const handleChange = (id) => {
    if (!onChange) return;

    let newSelected;
    if (selectedIds.includes(id)) {
      newSelected = selectedIds.filter((item) => item !== id);
    } else {
      if (maxSelections && selectedIds.length >= maxSelections) {
        return;
      }
      newSelected = [...selectedIds, id];
    }

    // Find full option objects for selected IDs
    const selectedOptions = options.filter((opt) =>
      newSelected.includes(opt.id)
    );

    // Return in API format
    onChange({
      data: selectedOptions.map((opt) => ({
        id: opt.id,
        attributes: {
          label: opt.label,
          slug: opt.slug,
        },
      })),
    });
  };

  return (
    <div className={`card-body card-body px-0 pt-0 ${className}`}>
      {label && (
        <div className="heading-color ff-heading fw500 mb10">
          {label}
          {showSelectionsCount && (
            <span className="text-sm text-muted ml-2">
              {" "}
              ({selectedIds.length}
              {maxSelections ? `/${maxSelections}` : ""})
            </span>
          )}
        </div>
      )}

      <div className={`checkbox-style1 ${horizontal ? "d-flex gap-5" : ""}`}>
        {options.map((option, i) => {
          const isDisabled =
            disabled ||
            (maxSelections &&
              selectedIds.length >= maxSelections &&
              !selectedIds.includes(option.id));

          return (
            <label
              key={option.id || i}
              className={`custom_filter_checkbox ${
                isDisabled ? "opacity-50" : ""
              }`}
            >
              {option.label}
              <input
                type="checkbox"
                name={name}
                value={option.id}
                checked={selectedIds.includes(option.id)}
                onChange={() => handleChange(option.id)}
                disabled={isDisabled}
              />
              <span className="checkmark" />
            </label>
          );
        })}
      </div>

      {error && <div className="mt10 text-danger">{error}</div>}
    </div>
  );
}
