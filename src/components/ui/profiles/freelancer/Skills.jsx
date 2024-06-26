import React from "react";

export default function Skills({ skills }) {
  if (skills.length === 0) {
    return;
  }
  return (
    <div className="sidebar-widget mb30 pb20 bdrs8">
      <h4 className="widget-title">Δεξιότητες</h4>
      <ul className="tags mt20">
        {skills.map((skill, i) => (
          <li key={i}>
            <p>{skill.attributes.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
