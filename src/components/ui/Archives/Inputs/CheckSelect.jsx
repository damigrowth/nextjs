"use client";

export default function CheckSelect({ options, value, onChange, name, error }) {
  return (
    <div className="card-body card-body px-0 pt-0">
      <div className="checkbox-style1 mb15">
        {options.map((option, i) => (
          <label key={i} className="custom_filter_checkbox">
            {option.label}
            <input
              type="checkbox"
              name={name}
              value="true"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span className="checkmark" />
          </label>
        ))}
      </div>
      {error && <div className="mt10 text-danger">{error}</div>}
    </div>
  );
}
