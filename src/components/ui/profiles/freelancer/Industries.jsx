import React from "react";

export default function Industries({ industries }) {
  if (industries.length === 0) {
    return;
  }
  return (
    <div className="list1 mt60">
      <h6 className="fw500">Κύριοι Κλάδοι Πελατών</h6>
      <ul className="tags mt20">
        {industries.map((industry, i) => (
          <li key={i}>
            <p className="orange ">{industry.attributes.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
